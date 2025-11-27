import React, { useState, useEffect } from "react";
import { Layout, Menu, Dropdown, Avatar, Button, Space } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  CarOutlined,
  LogoutOutlined,
  DownOutlined,
  ShopOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  FileTextOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import useAuthen from "../hooks/useAuthen";
import { Link } from "react-router-dom";
const { Header, Content, Footer, Sider } = Layout;

function getItem(label, key, icon, children, path) {
  return { key, icon, children, label, path };
}

const adminMenuItems = [
  getItem(
    "Tổng quan",
    "dashboard",
    <DashboardOutlined />,
    null,
    "/admin/dashboard"
  ),
  getItem("Báo cáo đại lý", "reports", <BarChartOutlined />, [
    getItem(
      "Doanh số theo đại lý",
      "sales-by-dealer",
      <PieChartOutlined />,
      null,
      "/admin/sales-by-dealer"
    ),
    getItem(
      "Kho hàng & Tiêu thụ đại lý",
      "inventory-consumption",
      <FileTextOutlined />,
      null,
      "/admin/inventory-consumption"
    ),
  ]),
  getItem(
    "Quản lý nhân viên EVM",
    "staff-management",
    <TeamOutlined />,
    null,
    "/admin/staff-management"
  ),
  getItem(
    "Kho hàng",
    "manufacturer-inventory",
    <CarOutlined />,
    null,
    "/admin/manufacturer-inventory"
  ),
];

const Admin = ({ children }) => {
  const navigate = useNavigate();
  const { logout, userDetail } = useAuthen();

  const storeDefaultSelectedKeys = (keys) => {
    sessionStorage.setItem("selectedMenuKey", keys);
  };

  const resetDefaultSelectedKeys = () => {
    const selectedKeys = sessionStorage.getItem("selectedMenuKey");
    return selectedKeys ? selectedKeys : "dashboard";
  };

  const defaultSelectedKeys = resetDefaultSelectedKeys();

  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const renderMenuItems = (items) => {
    return items.map((item) => {
      if (item.children && item.children.length > 0) {
        return (
          <Menu.SubMenu key={item.key} icon={item.icon} title={item.label}>
            {renderMenuItems(item.children)}
          </Menu.SubMenu>
        );
      } else {
        return (
          <Menu.Item
            key={item.key}
            icon={item.icon}
            onClick={() => storeDefaultSelectedKeys([item.key])}
          >
            <Link to={item.path}>{item.label}</Link>
          </Menu.Item>
        );
      }
    });
  };

  const user = {
    name: userDetail?.userName || "Admin User",
    avatar: userDetail?.avatar || "https://i.pravatar.cc/150?img=3",
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Hồ sơ cá nhân",
      onClick: () => navigate("/admin/profile"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: (
        <div className="flex items-center text-red-500">
          <LogoutOutlined />
        </div>
      ),
      label: <div className="text-red-500">Đăng xuất</div>,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Sider
        width={250}
        breakpoint="lg"
        collapsedWidth="0"
        defaultCollapsed
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        className="shadow-lg"
        style={{
          position: "fixed",
          height: "100vh",
          left: 0,
          top: 0,
          zIndex: 100,
        }}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-200 bg-white">
          <div className="text-xl font-bold text-blue-600">Hệ thống EVM</div>
        </div>
        <Menu
          theme="light"
          defaultSelectedKeys={defaultSelectedKeys}
          mode="inline"
          className="border-0 h-full"
          defaultOpenKeys={["reports"]}
          style={{
            backgroundColor: "white",
            height: "calc(100vh - 64px)",
            overflow: "auto",
          }}
        >
          {renderMenuItems(adminMenuItems)}
        </Menu>
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 0 : 250 }}>
        <Header
          className="sticky top-0 z-50 shadow-md flex items-center justify-between px-6"
          style={{
            background: "white",
            height: "64px",
            padding: "0 24px",
          }}
        >
          <div className="flex items-center"></div>

          <div className="flex items-center">
            <Dropdown
              menu={{ items: userMenuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button
                type="text"
                className="flex items-center text-white hover:bg-white hover:bg-opacity-20 border-0 h-10"
                style={{ padding: "4px 12px" }}
              >
                <Space>
                  <Avatar
                    size={32}
                    icon={<UserOutlined />}
                    className="border-2 border-white"
                  />
                  <span className="text-black font-medium">{user?.name}</span>
                  <DownOutlined className="text-black text-xs" />
                </Space>
              </Button>
            </Dropdown>
          </div>
        </Header>

        <Content style={{ minHeight: "calc(100vh - 128px)", padding: "24px" }}>
          <div className="bg-white rounded-lg shadow-sm p-6 min-h-full">
            {children}
          </div>
        </Content>

        <Footer
          className="text-center border-t border-gray-200"
          style={{
            padding: "16px 24px",
            fontSize: "14px",
            color: "#666",
            backgroundColor: "white",
          }}
        >
          <div className="flex justify-center items-center">
            <span>
              © {new Date().getFullYear()} Hệ thống EVM. Tất cả các quyền được
              bảo lưu.
            </span>
          </div>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default Admin;
