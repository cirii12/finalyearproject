import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Tabs,
  Typography,
  Upload,
  Modal,
} from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import Navbar from './Navbar';
import Footer from './Footer';
import { register } from '../services/api'; // ✅ API import
import { toast } from 'react-toastify';

const { Title, Text, Link } = Typography;
const { TabPane } = Tabs;
const { Dragger } = Upload;

const Registration = () => {
  const [form] = Form.useForm();
  const [accountType, setAccountType] = useState('individual');
  const [loading, setLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [tempValues, setTempValues] = useState(null);

  const onTabChange = (key) => {
    setAccountType(key);
    form.resetFields();
  };

  const draggerProps = {
    beforeUpload: () => false,
    multiple: false,
    accept: '.png,.jpg,.jpeg,.pdf',
  };

  const onFinish = async (values) => {
    if (accountType === 'organization' && !showTermsModal && !tempValues) {
      setTempValues(values);
      setShowTermsModal(true);
      return;
    }

    const registrationValues = values || tempValues;
    const formData = new FormData();

    if (accountType === 'individual') {
      formData.append('fullName', registrationValues.fullName);
      formData.append('email', registrationValues.email);
      formData.append('password', registrationValues.password);
      if (registrationValues.idCardNumber) {
        formData.append('idCardNumber', registrationValues.idCardNumber);
      }
      formData.append('location', registrationValues.location);
      formData.append('phone', registrationValues.phone);

      const file = registrationValues.upload?.[0]?.originFileObj;
      if (file) {
        formData.append('idCardPhoto', file);
      }
    } else {
      formData.append('organizationName', registrationValues.organizationName);
      formData.append('contactPerson', registrationValues.contactPerson);
      formData.append('email', registrationValues.email);
      formData.append('password', registrationValues.password);
      formData.append('businessRegistrationNumber', registrationValues.businessRegistrationNumber);
      formData.append('panNumber', registrationValues.panNumber);
      formData.append('location', registrationValues.location);
      formData.append('phone', registrationValues.phone);
      formData.append('agreedToTerms', 'true');

      const file = registrationValues.upload?.[0]?.originFileObj;
      if (file) {
        formData.append('documentPhoto', file);
      }
    }

    setLoading(true);
    try {
      await register(accountType, formData);
      toast.success('Registration successful!');
      form.resetFields();
      setTempValues(null);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleTermsAgree = () => {
    setShowTermsModal(false);
    onFinish(tempValues);
  };

  const handleTermsCancel = () => {
    setShowTermsModal(false);
    setTempValues(null);
  };

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 500, margin: '0 auto', padding: 20 }}>
        <Title level={3} style={{ textAlign: 'center', color: '#ec4899' }}>
          Create Your Account
        </Title>
        <Text style={{ display: 'block', textAlign: 'center', marginBottom: 10 }}>
          Join our community of crochet lovers and get exclusive access to new products and special offers
        </Text>

        <Tabs defaultActiveKey="individual" onChange={onTabChange} centered>
          <TabPane tab="Individual" key="individual" />
          <TabPane tab="Organization" key="organization" />
        </Tabs>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ marginTop: 10 }}
        >
          {accountType === 'individual' ? (
            <>
              <Form.Item
                label="Full Name"
                name="fullName"
                rules={[{ required: true, message: 'Please enter your full name' }]}
              >
                <Input placeholder="Enter your full name" />
              </Form.Item>

              <Form.Item
                label="ID Card Number"
                name="idCardNumber"
              >
                <Input placeholder="Enter your ID card number (optional)" />
              </Form.Item>

              <Form.Item
                label="Location"
                name="location"
                rules={[{ required: true, message: 'Please enter your location' }]}
              >
                <Input placeholder="Enter your location" />
              </Form.Item>

              <Form.Item
                label="Phone Number"
                name="phone"
                rules={[{ required: true, message: 'Please enter your phone number' }]}
              >
                <Input placeholder="Enter your phone number" />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item
                label="Organization Name"
                name="organizationName"
                rules={[{ required: true, message: 'Please enter organization name' }]}
              >
                <Input placeholder="Enter organization name" />
              </Form.Item>

              <Form.Item
                label="Contact Person"
                name="contactPerson"
                rules={[{ required: true, message: 'Please enter contact person name' }]}
              >
                <Input placeholder="Enter contact person" />
              </Form.Item>

              <Form.Item
                label="Business Registration Number"
                name="businessRegistrationNumber"
                rules={[{ required: true, message: 'Please enter registration number' }]}
              >
                <Input placeholder="Enter registration number" />
              </Form.Item>

              <Form.Item
                label="PAN Number"
                name="panNumber"
                rules={[{ required: true, message: 'Please enter PAN number' }]}
              >
                <Input placeholder="Enter PAN number" />
              </Form.Item>

              <Form.Item
                label="Location"
                name="location"
                rules={[{ required: true, message: 'Please enter location' }]}
              >
                <Input placeholder="Enter location" />
              </Form.Item>

              <Form.Item
                label="Phone Number"
                name="phone"
                rules={[{ required: true, message: 'Please enter phone number' }]}
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </>
          )}

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 8, message: 'Password must be at least 8 characters' },
            ]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>

          <Form.Item
            label={accountType === 'individual' ? 'Upload ID Card' : 'Upload Registration Document'}
            name="upload"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
            rules={[{ required: true, message: 'Please upload a file' }]}
          >
            <Dragger {...draggerProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file to upload</p>
              <p className="ant-upload-hint">Accepts PNG, JPG, or PDF files</p>
            </Dragger>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{ backgroundColor: '#070606ff', borderColor: '#090909ff' }}
            >
              Register
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Text>Have an account? </Text>
          <Link href="#" style={{ color: '#ec4899' }}>
            Sign in
          </Link>
        </div>

        <Modal
          title="Terms and Conditions"
          open={showTermsModal}
          onOk={handleTermsAgree}
          onCancel={handleTermsCancel}
          okText="I Agree"
          cancelText="Cancel"
          maskClosable={false}
          okButtonProps={{ style: { backgroundColor: '#ec4899', borderColor: '#ec4899' } }}
        >
          <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '10px' }}>
            <Title level={4}>Lunasu Crochet Organization Terms</Title>
            <p>By registering as an organization on Lunasu Crochet, you agree to the following terms and conditions:</p>
            <ol>
              <li><strong>Verification:</strong> All organization accounts are subject to verification and approval by the admin.</li>
              <li><strong>Usage of Items:</strong> Handcrafted items purchased or donated through this platform must be used for the stated charitable or organizational purposes.</li>
              <li><strong>Content Accuracy:</strong> You ensure that all information provided during registration, including registration numbers and documents, is accurate and up to date.</li>
              <li><strong>Respectful Conduct:</strong> Organizations must maintain professional and respectful communication with sellers and other users.</li>
              <li><strong>Platform Fees:</strong> You agree to any platform fees or transaction charges applicable to organization accounts.</li>
              <li><strong>Liability:</strong> Lunasu Crochet is not liable for any disputes arising from items received or interactions between users.</li>
            </ol>
            <p>Please read our full <Link href="/about">Privacy Policy</Link> for more details on how we handle your data.</p>
          </div>
        </Modal>
      </div>
      <Footer />
    </div>
  );
};

export default Registration;
