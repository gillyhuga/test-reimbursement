'use client';
import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, InputNumber, message, Select } from 'antd';
import axios from 'axios';
import moment from 'moment';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Home = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/employees');
      setEmployees(response.data);
    } catch (error) {
      message.error('Error fetching employees');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReimbursement = async (values) => {
    try {
      await axios.post('/api/reimbursements', {
        ...values,
        date: values.date.format(),
        items: values.items.map((item) => ({
          ...item,
          date: item.date.format(),
        })),
      });
      message.success('Reimbursement added successfully');
      setVisible(false);
      form.resetFields();
      fetchEmployees();
    } catch (error) {
      message.error('Error adding reimbursement');
    }
  };

  const exportByEmployeePDF = () => {
    const doc = new jsPDF();
    doc.text('Reimbursement Details', 14, 10);
    let grandTotal = 0;
    const allRows = [];
    if (!dateRange) {
      message.warning('Select date first');
      return;
    }

    employees.forEach((employee) => {
      let employeeTotal = 0;
      const employeeRows = [];
      let lastReimbursementDate = '';
      let namePrinted = false;
    
      employee.reimbursements.forEach((reimbursement) => {
        if (reimbursement.date >= dateRange[0]?.toISOString() && reimbursement.date <= dateRange[1]?.toISOString()) {
          reimbursement.items.forEach((item) => {
            const amount = parseFloat(item.amount);
            employeeTotal += amount;
            grandTotal += amount;

            const employeeId = employee.employeeId;
            const name = employee.name;
            const reimbursementDate = moment(reimbursement.date).format('DD/MM/YYYY');

            if (!namePrinted) {
              if (reimbursementDate !== lastReimbursementDate) {
                employeeRows.push([
                  employeeId,
                  name,
                  reimbursementDate,
                  item.description,
                  moment(item.date).format('DD/MM/YYYY'),
                  `Rp ${amount.toLocaleString()}`,
                ]);
                lastReimbursementDate = reimbursementDate;
                namePrinted = true;
              } else {
                employeeRows.push([
                  employeeId,
                  name,
                  '',
                  item.description,
                  moment(item.date).format('DD/MM/YYYY'),
                  `Rp ${amount.toLocaleString()}`,
                ]);
                namePrinted = true;
              }
            } else {
              if (reimbursementDate !== lastReimbursementDate) {
                employeeRows.push([
                  '',
                  '',
                  reimbursementDate,
                  item.description,
                  moment(item.date).format('DD/MM/YYYY'),
                  `Rp ${amount.toLocaleString()}`,
                ]);
                lastReimbursementDate = reimbursementDate;
              } else {
                employeeRows.push([
                  '',
                  '',
                  '',
                  item.description,
                  moment(item.date).format('DD/MM/YYYY'),
                  `Rp ${amount.toLocaleString()}`,
                ]);
              }
            }
          });
        }

      });

      if (employeeTotal > 0) {
        employeeRows.push([
          '', '', '', '', 'TOTAL', `Rp ${employeeTotal.toLocaleString()}`
        ]);

        allRows.push(...employeeRows);
      }
    });

    if (grandTotal > 0) {
      allRows.push(['', '', '', '', 'GRAND TOTAL', `Rp ${grandTotal.toLocaleString()}`]);
    }

    doc.autoTable({
      head: [['ID Karyawan', 'Nama', 'Tanggal Pengajuan', 'Item', 'Tgl Transaksi', 'Nominal']],
      body: allRows,
      startY: 20,
      styles: { halign: 'right', cellWidth: 'wrap' },
      columnStyles: { 0: { halign: 'left', fontStyle: 'bold' }, 1: { halign: 'left' }, 2: { halign: 'left' } },
    });

    doc.save('reimbursement_report_by_employee.pdf');
  };


  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Reimbursement Report', 14, 10);
    const rows = [];
    const groupedByDate = {};
    if (!dateRange) {
      message.warning('Select date first');
      return;
    }

    employees.forEach((employee) => {
      employee.reimbursements.forEach((reimbursement) => {
        if (reimbursement.date >= dateRange[0]?.toISOString() && reimbursement.date <= dateRange[1]?.toISOString()) {
          const date = moment(reimbursement.date).format('YYYY-MM-DD');
          if (!groupedByDate[date]) {
            groupedByDate[date] = {
              totalCount: 0,
              totalAmount: 0,
            };
          }
          groupedByDate[date].totalCount++;
          groupedByDate[date].totalAmount += reimbursement.items.reduce(
            (total, item) => total + item.amount,
            0
          );
        };
      });
    });

    Object.keys(groupedByDate).forEach((date) => {
      const group = groupedByDate[date];
      rows.push([
        moment(date).format('DD/MM/YYYY'),
        group.totalCount,
        `Rp ${group.totalAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`,
      ]);
    });

    doc.autoTable({
      head: [['Tanggal', 'Jumlah', 'Pengajuan Nominal']],
      body: rows,
      startY: 20,
      styles: { halign: 'center' },
    });

    doc.save('reimbursement_report.pdf');
  };

  const columns = [
    { title: 'Employee ID', dataIndex: 'employeeId', key: 'employeeId' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Balance',
      dataIndex: 'balances',
      key: 'balances',
      render: (balances) => balances[0]?.balance || 0,
    }
  ];

  return (
    <div style={{ padding: '0 16px' }}>
      <div style={{ margin: '0 auto', maxWidth: '1200px' }}>
        <Button type="primary" onClick={() => setVisible(true)} style={{ marginBottom: 16 }}>
          Add Reimbursement
        </Button>
        <RangePicker
          style={{ marginBottom: 16, marginLeft: 16 }}
          onChange={(dates) => setDateRange(dates)}
        />
        <Button onClick={exportPDF} style={{ marginBottom: 16, marginLeft: 16 }}>
          Export Report
        </Button>
        <Button onClick={exportByEmployeePDF} style={{ marginBottom: 16, marginLeft: 16 }}>
          Export by Employee
        </Button>
        <Table columns={columns} dataSource={employees} rowKey="employeeId" loading={loading} />
      </div>
      <Modal
        title="Add Reimbursement"
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleAddReimbursement}
          layout="vertical"
        >
          <Form.Item
            name="employeeId"
            label="Employee ID"
            rules={[{ required: true, message: 'Please select an employee' }]}
          >
            <Select
              showSearch
              placeholder="Select an employee"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {employees.map(employee => (
                <Option key={employee.employeeId} value={employee.employeeId}>
                  {employee.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Please select a date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, fieldKey, ...restField }) => (
                  <div key={key} style={{ marginBottom: 16, border: '1px solid #d9d9d9', padding: 16, borderRadius: 4 }}>
                    <Form.Item
                      {...restField}
                      name={[name, 'description']}
                      fieldKey={[fieldKey, 'description']}
                      label="Description"
                      rules={[{ required: true, message: 'Missing description' }]}
                    >
                      <TextArea rows={2} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'amount']}
                      fieldKey={[fieldKey, 'amount']}
                      label="Amount"
                      rules={[{ required: true, message: 'Missing amount' }]}
                    >
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'date']}
                      fieldKey={[fieldKey, 'date']}
                      label="Date"
                      rules={[{ required: true, message: 'Missing date' }]}
                    >
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Button type="danger" onClick={() => remove(name)} block>
                      Remove Item
                    </Button>
                  </div>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    Add Item
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Home;
