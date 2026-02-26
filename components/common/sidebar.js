// components/common/Sidebar.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; 
import { HiChartBar, HiCog, HiCube, HiCurrencyDollar, HiHome, HiOutlineArchive, HiOutlineChartBar, HiOutlineChevronDown, HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineChevronUp, HiOutlineClipboardList, HiOutlineClock, HiOutlineCog, HiOutlineCube, HiOutlineCurrencyDollar, HiOutlineDocumentReport, HiOutlineDocumentText, HiOutlineDownload, HiOutlineGlobeAlt, HiOutlineHome, HiOutlineLogout, HiOutlineOfficeBuilding, HiOutlinePlus, HiOutlineQuestionMarkCircle, HiOutlineSearch, HiOutlineShieldCheck, HiOutlineTemplate, HiOutlineTruck, HiOutlineUserGroup, HiOutlineUsers, HiTruck, HiUsers } from 'react-icons/hi';
import Image from 'next/image'; 

// Logo Component
const Logo = ({ collapsed }) => (
  <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-center'} px-4 py-6`}>
    <div className="flex items-center space-x-2">
      {collapsed ? (
        <Image 
          src="/logo.png"
          alt="LogiSwift" 
          width={32} 
          height={32}
          className="flex-shrink-0"
        />
      ) : (
        <Image 
          src="/logo.png"
          alt="LogiSwift" 
          width={120} 
          height={32}
          className="items-center"
        />
      )}
    </div>
  </div>
);

// Menu Items Configuration
const menuItems = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: <HiOutlineHome className="w-5 h-5" />,
    activeIcon: <HiHome className="w-5 h-5" />,
  },
  {
    title: 'Bookings',
    path: '/admin/Bookings',
    icon: <HiOutlineTruck className="w-5 h-5" />,
    activeIcon: <HiTruck className="w-5 h-5" />, 
    badgeColor: '#E67E22',
    children: [
      {
        title: 'All Bookings',
        path: '/Bookings/all_bookings',
        icon: <HiOutlineClipboardList className="w-4 h-4" />,
      },
      {
        title: 'Create New',
        path: '/Bookings/create_bookings',
        icon: <HiOutlinePlus className="w-4 h-4" />,
      }, 
    ],
  },
  {
    title: 'Shipping',
    path: '/admin/Bookings',
    icon: <HiOutlineTruck className="w-5 h-5" />,
    activeIcon: <HiTruck className="w-5 h-5" />, 
    badgeColor: '#E67E22',
    children: [
      {
        title: 'All Shipping',
        path: '/shippings/all_shipping',
        icon: <HiOutlineClipboardList className="w-4 h-4" />,
      }
    ],
  },
  {
    title: 'User Roles',
    path: '/admin/customers',
    icon: <HiOutlineUsers className="w-5 h-5" />,
    activeIcon: <HiUsers className="w-5 h-5" />, 
    badgeColor: '#3C719D',
    children: [
      {
        title: 'All Users',
        path: '/users/customers',
        icon: <HiOutlineUserGroup className="w-4 h-4" />,
      },
      {
        title: 'Create Staff',
        path: '/users/create_staff',
        icon: <HiOutlinePlus className="w-4 h-4" />,
      }, 
    ],
  },
  {
    title: 'Warehouse',
    path: '/admin/warehouse',
    icon: <HiOutlineCube className="w-5 h-5" />,
    activeIcon: <HiCube className="w-5 h-5" />,
    children: [
      {
        title: 'Dashboard',
        path: '/admin/warehouse',
        icon: <HiOutlineHome className="w-4 h-4" />,
      },
      {
        title: 'Receive Cargo',
        path: '/admin/warehouse/receive',
        icon: <HiOutlineDownload className="w-4 h-4" />,
      },
      {
        title: 'Containers',
        path: '/admin/warehouse/containers',
        icon: <HiOutlineDownload className="w-4 h-4" />,
      },
      {
        title: 'Consolidation',
        path: '/admin/warehouse/consolidation',
        icon: <HiOutlineArchive className="w-4 h-4" />,
      },
    ],
  },
  {
    title: 'Finance',
    path: '/admin/finance',
    icon: <HiOutlineCurrencyDollar className="w-5 h-5" />,
    activeIcon: <HiCurrencyDollar className="w-5 h-5" />, 
    badgeColor: '#10B981',
    children: [
      {
        title: 'All Invoices',
        path: '/admin/finance/invoices',
        icon: <HiOutlineDocumentText className="w-4 h-4" />,
      },
      {
        title: 'Create Invoice',
        path: '/admin/finance/invoices/create',
        icon: <HiOutlinePlus className="w-4 h-4" />,
      },
      {
        title: 'Pending Payments',
        path: '/admin/finance/pending',
        icon: <HiOutlineClock className="w-4 h-4" />,
        badge: 3,
      },
    ],
  },
  {
    title: 'Reports',
    path: '/admin/reports',
    icon: <HiOutlineChartBar className="w-5 h-5" />,
    activeIcon: <HiChartBar className="w-5 h-5" />,
    children: [
      {
        title: 'Shipment Reports',
        path: '/admin/reports/Bookings',
        icon: <HiOutlineDocumentReport className="w-4 h-4" />,
      },
      {
        title: 'Customer Reports',
        path: '/admin/reports/customers',
        icon: <HiOutlineUsers className="w-4 h-4" />,
      },
      {
        title: 'Financial Reports',
        path: '/admin/reports/financial',
        icon: <HiOutlineCurrencyDollar className="w-4 h-4" />,
      },
    ],
  },
  {
    title: 'Settings',
    path: '/admin/settings',
    icon: <HiOutlineCog className="w-5 h-5" />,
    activeIcon: <HiCog className="w-5 h-5" />,
    children: [
      {
        title: 'Company Profile',
        path: '/admin/settings/company',
        icon: <HiOutlineOfficeBuilding className="w-4 h-4" />,
      },
      {
        title: 'User Management',
        path: '/admin/settings/users',
        icon: <HiOutlineUserGroup className="w-4 h-4" />,
      },
      {
        title: 'Role & Permissions',
        path: '/admin/settings/roles',
        icon: <HiOutlineShieldCheck className="w-4 h-4" />,
      },
      {
        title: 'Multi-Country',
        path: '/admin/settings/countries',
        icon: <HiOutlineGlobeAlt className="w-4 h-4" />,
      },
      {
        title: 'Templates',
        path: '/admin/settings/templates',
        icon: <HiOutlineTemplate className="w-4 h-4" />,
      },
    ],
  },
];

// Menu Item Component
const MenuItem = ({ item, collapsed, depth = 0, searchTerm = '', onMenuClick, openMenuKey, setOpenMenuKey }) => {
  const pathname = usePathname();
  
  // Create a unique key for this menu item
  const menuKey = item.title;
  const isOpen = openMenuKey === menuKey;
  
  const hasChildren = item.children && item.children.length > 0;
  const isActive = pathname === item.path || 
    (item.children && item.children.some(child => pathname === child.path));

  // Check if item matches search
  const matchesSearch = searchTerm ? 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.children && item.children.some(child => 
      child.title.toLowerCase().includes(searchTerm.toLowerCase())
    )) : true;

  // Check if any child matches search
  const hasMatchingChild = searchTerm && item.children ? 
    item.children.some(child => 
      child.title.toLowerCase().includes(searchTerm.toLowerCase())
    ) : false;

  // Auto-open if has active child or matches search
  useEffect(() => {
    if (hasChildren && !collapsed) {
      const hasActiveChild = item.children.some(child => pathname === child.path);
      if (hasActiveChild || hasMatchingChild) {
        setOpenMenuKey(menuKey);
      }
    }
  }, [pathname, hasChildren, item.children, collapsed, hasMatchingChild, menuKey, setOpenMenuKey]);

  // Don't render if doesn't match search and no children match
  if (searchTerm && !matchesSearch && !hasMatchingChild) {
    return null;
  }

  const handleClick = (e) => {
    if (hasChildren) {
      e.preventDefault();
      e.stopPropagation();
      
      if (collapsed) {
        // In collapsed state, toggle the menu
        if (isOpen) {
          setOpenMenuKey(null); // Close if already open
        } else {
          setOpenMenuKey(menuKey); // Open this menu
        }
      } else {
        // In expanded state, close other menus and toggle this one
        if (isOpen) {
          setOpenMenuKey(null); // Close if already open
        } else {
          setOpenMenuKey(menuKey); // Open this menu, closing others
        }
      }
    } else {
      // For items without children, navigate and close any open menus
      setOpenMenuKey(null);
      onMenuClick?.();
    }
  };

  const handleChildClick = () => {
    setOpenMenuKey(null);
    onMenuClick?.();
  };

  const handleToggleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (collapsed) {
      // In collapsed state, toggle the menu
      if (isOpen) {
        setOpenMenuKey(null);
      } else {
        setOpenMenuKey(menuKey);
      }
    } else {
      // In expanded state, close other menus and toggle this one
      if (isOpen) {
        setOpenMenuKey(null);
      } else {
        setOpenMenuKey(menuKey);
      }
    }
  };

  return (
    <div className="relative">
      <Link
        href={item.path}
        onClick={handleClick}
        className={`
          flex items-center px-4 py-2.5 mx-2 rounded-lg transition-all duration-200
          ${depth > 0 ? 'ml-6' : ''}
          ${isActive 
            ? 'text-white shadow-lg' 
            : 'text-gray-700 hover:bg-blue-50'
          }
          ${collapsed ? 'justify-center' : 'justify-start'}
          group relative
          cursor-pointer
        `}
        style={{
          backgroundColor: isActive ? '#E67E22' : 'transparent',
          boxShadow: isActive ? '0 4px 12px rgba(230, 126, 34, 0.3)' : 'none',
        }}
      >
        <span className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-[#3C719D]'}>
          {isActive && item.activeIcon ? item.activeIcon : item.icon}
        </span>
        
        {!collapsed && (
          <>
            <span className="ml-3 flex-1 text-sm font-medium">{item.title}</span>
            {item.badge && (
              <span 
                className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: item.badgeColor || '#E67E22' }}
              >
                {item.badge}
              </span>
            )}
            {hasChildren && (
              <button 
                onClick={handleToggleClick}
                className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                {isOpen ? (
                  <HiOutlineChevronUp className="w-4 h-4" />
                ) : (
                  <HiOutlineChevronDown className="w-4 h-4" />
                )}
              </button>
            )}
          </>
        )}

        {collapsed && (
          <>
            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
              {item.title}
              {item.badge && (
                <span className="ml-2 px-1.5 py-0.5 bg-[#E67E22] rounded-full text-xs">
                  {item.badge}
                </span>
              )}
            </div>
          </>
        )}
      </Link>

      {/* Children menu - show when open */}
      {hasChildren && isOpen && (
        <div className={`
          ${collapsed ? 'absolute left-full top-0 ml-2 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[200px] z-50' : 'mt-1'}
        `}>
          {item.children
            .filter(child => !searchTerm || child.title.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((child, index) => (
              <MenuItem
                key={index}
                item={child}
                collapsed={collapsed}
                depth={collapsed ? 0 : depth + 1}
                searchTerm={searchTerm}
                onMenuClick={handleChildClick}
                openMenuKey={openMenuKey}
                setOpenMenuKey={setOpenMenuKey}
              />
            ))}
        </div>
      )}

      {/* Dropdown indicator for collapsed state - separate clickable area */}
      {collapsed && hasChildren && (
        <button
          onClick={handleToggleClick}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-500 hover:text-[#E67E22] focus:outline-none"
        >
          {isOpen ? (
            <HiOutlineChevronUp className="w-4 h-4" />
          ) : (
            <HiOutlineChevronDown className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  );
};

// User Profile Component
const UserProfile = ({ collapsed }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`mt-auto border-t border-gray-200 pt-4 ${collapsed ? 'px-2' : 'px-4'}`}>
      <div className="relative">
        <button
          onClick={() => !collapsed && setIsOpen(!isOpen)}
          className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'} w-full space-x-3 hover:bg-gray-50 rounded-lg p-2 transition-colors group relative`}
        >
          <div className="relative">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ 
                background: 'linear-gradient(135deg, #E67E22 0%, #3C719D 100%)'
              }}
            >
              A
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          
          {!collapsed && (
            <>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-gray-800">Admin User</p>
                <p className="text-xs text-gray-500">admin@logitrack.com</p>
              </div>
              <HiOutlineChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </>
          )}

          {collapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
              Admin User
            </div>
          )}
        </button>

        {!collapsed && isOpen && (
          <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
            <Link 
              href="/admin/profile" 
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              <HiOutlineUserGroup className="w-4 h-4 mr-2 text-[#3C719D]" />
              Profile
            </Link>
            <Link 
              href="/admin/settings" 
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              <HiOutlineCog className="w-4 h-4 mr-2 text-[#3C719D]" />
              Settings
            </Link>
            <button 
              className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
              onClick={() => {
                setIsOpen(false);
              }}
            >
              <HiOutlineLogout className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuKey, setOpenMenuKey] = useState(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleMenuClick = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      {isMobile && mobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {isMobile && !mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
          style={{ color: '#E67E22' }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      <aside
        style={{ 
          width: collapsed ? 80 : 280,
          transform: isMobile && !mobileOpen ? 'translateX(-280px)' : 'translateX(0)',
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s ease-in-out',
        }}
        className="fixed left-0 top-0 h-full bg-white z-50 overflow-hidden"
      >
        <div className="flex flex-col h-full relative">
          <Logo collapsed={collapsed} />

          {!isMobile && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="absolute -right-3 top-6 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-[#E67E22] hover:border-[#E67E22] transition-all duration-200 shadow-md z-50"
            >
              {collapsed ? (
                <HiOutlineChevronRight className="w-3 h-3" />
              ) : (
                <HiOutlineChevronLeft className="w-3 h-3" />
              )}
            </button>
          )}

          {!collapsed && (
            <div className="px-4 mb-4">
              <div className="relative">
                <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search menus..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22] transition-colors"
                />
              </div>
            </div>
          )}

          {collapsed && (
            <div className="px-2 mb-4">
              <button 
                className="w-full p-2 bg-[#E67E22] text-white rounded-lg hover:bg-[#d35400] transition-colors"
                onClick={() => {/* Handle create new */}}
              >
                <HiOutlinePlus className="w-5 h-5 mx-auto" />
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
            {menuItems.map((item, index) => (
              <MenuItem 
                key={index} 
                item={item} 
                collapsed={collapsed} 
                searchTerm={searchTerm}
                onMenuClick={handleMenuClick}
                openMenuKey={openMenuKey}
                setOpenMenuKey={setOpenMenuKey}
              />
            ))}
          </div>

          {!collapsed && (
            <div className="px-4 py-3 border-t border-gray-200">
              <Link href="/admin/help" className="flex items-center text-sm text-gray-600 hover:text-[#E67E22] transition-colors">
                <HiOutlineQuestionMarkCircle className="w-4 h-4 mr-2" />
                Help & Support
              </Link>
            </div>
          )}

          <UserProfile collapsed={collapsed} />
        </div>
      </aside>

      {!isMobile && (
        <div style={{ marginLeft: collapsed ? 80 : 280 }} className="transition-all duration-300" />
      )}
    </>
  );
}