import React, { useState } from "react";
import { Layout, Menu, Dropdown, Avatar, Button, Space } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined,
  DownOutlined,
  ShopOutlined,
  CarOutlined,
  TagOutlined,
  StockOutlined,
  FileTextOutlined,
  DollarOutlined,
  ContactsOutlined,
  BankOutlined,
  SwapOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import useAuthen from "../hooks/useAuthen";

const { Header, Content, Footer, Sider } = Layout;

function getItem(label, key, icon, children, path) {
  return { key, icon, children, label, path };
}

const adminMenuItems = [
  getItem("Quản lý đại lý", "9", <ShopOutlined />, [
    getItem(
      "Danh sách đại lý",
      "10",
      <ContactsOutlined />,
      null,
      "/evm-staff/dealer-list"
    ),
    getItem("Công nợ", "12", <DollarOutlined />, null, "/evm-staff/debts"),
  ]),
  getItem("Quản lý sản phẩm", "2", <CarOutlined />, [
    getItem("Danh mục xe", "3", <CarOutlined />, null, "/evm-staff/vehicles"),
    getItem(
      "Danh mục phiên bản xe",
      "vehicle-types",
      <TagOutlined />,
      null,
      "/evm-staff/vehicle-types"
    ),
    getItem(
      "Danh mục mẫu xe",
      "vehicle-catalog",
      <CarOutlined />,
      null,
      "/evm-staff/vehicle-models"
    ),
  ]),
  getItem("Quản lý kho", "4", <StockOutlined />, [
    getItem("Kho hàng", "4-1", <InboxOutlined />, null, "/evm-staff/inventory"),
    getItem(
      "Phân bổ cho đại lý",
      "4-2",
      <SwapOutlined />,
      null,
      "/evm-staff/allocate-inventory"
    ),
  ]),
];

const EvmStaff = ({ children }) => {
  const [current, setCurrent] = useState("1");
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { logout, userDetail } = useAuthen();

  // Xử lý cập nhật selected key dựa trên URL hiện tại khi component mount
  React.useEffect(() => {
    const currentPath = window.location.pathname;
    // Tìm menu item có path trùng với URL hiện tại
    const findMenuItemByPath = (items, targetPath) => {
      for (const item of items) {
        if (item.path === targetPath) {
          return item;
        }
        if (item.children) {
          const found = findMenuItemByPath(item.children, targetPath);
          if (found) return found;
        }
      }
      return null;
    };

    const menuItem = findMenuItemByPath(adminMenuItems, currentPath);
    if (menuItem) {
      setCurrent(menuItem.key);
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const user = {
    name: userDetail?.userName || "EVM Staff",
    avatar: userDetail?.avatar || "https://i.pravatar.cc/150?img=3",
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Hồ sơ cá nhân",
      onClick: () => navigate("/evm-staff/profile"),
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

  const handleMenuClick = ({ key }) => {
    const findMenuItem = (items, targetKey) => {
      for (const item of items) {
        if (item.key === targetKey) {
          return item;
        }
        if (item.children) {
          const found = findMenuItem(item.children, targetKey);
          if (found) return found;
        }
      }
      return null;
    };

    const menuItem = findMenuItem(adminMenuItems, key);
    if (menuItem && menuItem.path) {
      // Đảm bảo sidebar không bị collapse khi chuyển trang
      setCollapsed(false);
      // Cập nhật current key
      setCurrent(key);
      // Điều hướng đến trang
      navigate(menuItem.path);
    }
  };

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Sider
        width={250}
        breakpoint="lg"
        collapsedWidth="0"
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        collapsible={false}
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
          mode="inline"
          items={adminMenuItems}
          selectedKeys={[current]}
          className="border-0 h-full"
          defaultOpenKeys={["9", "2", "4", "6"]}
          theme="light"
          onClick={handleMenuClick}
          style={{
            backgroundColor: "white",
            height: "calc(100vh - 64px)",
            overflow: "auto",
          }}
        />
      </Sider>

      <Layout style={{ marginLeft: 250 }}>
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

export default EvmStaff;
