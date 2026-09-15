import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { getUser, clearAuth } from "../../utils/auth";
import { logoutAdmin } from "../../services/authService";
import { useAdminData } from "../../context/AdminDataContext";
import { toast } from "react-toastify";
import {
  LayoutDashboard,
  Mail,
  Calendar,
  Layers,
  Stethoscope,
  Image as ImageIcon,
  Star,
  User,
  UserPlus,
  UserCheck,
  CheckSquare,
  Users,
  MapPin,
  FileText,
  CreditCard,
  BarChart2,
  BookOpen,
  Settings,
  LogOut,
  X,
  MessageSquare,
  CalendarCheck,
  Globe,
  ChevronDown,
  ChevronRight,
  Receipt,
} from "lucide-react";
import doctorPhoto from "../../assets/doctor.jpg";

export default function Sidebar({ isOpen, isCollapsed, onClose }) {
  const user = getUser();
  const location = useLocation();
  const role =
    user?.role?.toLowerCase() === "admin" ||
    user?.role?.toLowerCase() === "administrator" ||
    !user?.role
      ? "admin"
      : user.role;
  const { stats, appointments } = useAdminData();
  const navigate = useNavigate();

  const enquiryCount = stats?.enquiries?.count ?? 0;
  const appointmentCount =
    appointments && appointments.length >= 0
      ? appointments.length
      : (stats?.appointments?.count ?? 0);

  const mainNavItems =
    role === "admin"
      ? [{ path: "/admin", label: "Dashboard", icon: LayoutDashboard }]
      : [];

  const websiteNavItems =
    role === "admin"
      ? [
          { path: "/admin/gallery", label: "Gallery", icon: ImageIcon },
          { path: "/admin/clinics", label: "Clinics", icon: MapPin },
          { path: "/admin/blogs", label: "Blogs", icon: BookOpen },
          {
            path: "/admin/enquiries",
            label: "Contact Enquiries",
            icon: Mail,
            badge: enquiryCount,
          },
        ]
      : [];

  const isWebsiteActive = websiteNavItems.some((item) =>
    location.pathname.startsWith(item.path)
  );

  const isPatientManagementActive =
    location.pathname.startsWith("/admin/appointments") ||
    location.pathname.startsWith("/admin/All-Appointments") ||
    location.pathname.startsWith("/admin/check-in") ||
    location.pathname.startsWith("/admin/opd-management");

  const [isAppointmentsSubOpen, setIsAppointmentsSubOpen] = useState(true);

  const receptionNavItemsTop =
    role === "admin"
      ? [
          { path: "/admin/doctor-queue", label: "Doctor Queue", icon: Users },
        ]
      : [];

  const billingNavItems =
    role === "admin"
      ? [
          { path: "/admin/billing", label: "Billing", icon: FileText },
          { path: "/admin/payments", label: "Payments", icon: CreditCard },
        ]
      : [];

  const isBillingActive = billingNavItems.some((item) =>
    location.pathname.startsWith(item.path)
  );

  const [openMenu, setOpenMenu] = useState(() => {
    if (isWebsiteActive) return "website";
    if (isPatientManagementActive) return "patientManagement";
    if (isBillingActive) return "billing";
    return null;
  });

  const isWebsiteOpen = openMenu === "website";
  const isPatientManagementOpen = openMenu === "patientManagement";
  const isBillingOpen = openMenu === "billing";

  useEffect(() => {
    if (isWebsiteActive) setOpenMenu("website");
    else if (isPatientManagementActive) setOpenMenu("patientManagement");
    else if (isBillingActive) setOpenMenu("billing");
  }, [location.pathname]);

  const receptionNavItemsBottom =
    role === "admin"
      ? [
          { path: "/admin/patients", label: "Patients", icon: User },
          { path: "/admin/reports", label: "Reports", icon: BarChart2 },
        ]
      : [];

  const doctorNavItems =
    role === "doctor"
      ? [
          { path: "/doctor", label: "Doctor Dashboard", icon: LayoutDashboard },
          { path: "/doctor/my-queue", label: "My Queue", icon: Users },
          {
            path: "/doctor/todays-appointments",
            label: "Today's Appointments",
            icon: Calendar,
          },
          {
            path: "/doctor/all-appointments",
            label: "All Appointments",
            icon: Calendar,
          },
          { path: "/doctor/consultation", label: "Consultation", icon: MessageSquare },
          {
            path: "/doctor/medical-records",
            label: "Medical Records",
            icon: FileText,
          },
          {
            path: "/doctor/prescriptions",
            label: "Prescriptions",
            icon: FileText,
          },
          { path: "/doctor/follow-ups", label: "Follow-ups", icon: CalendarCheck },
          { path: "/doctor/reports", label: "Reports", icon: BarChart2 },
        ]
      : [];

  const handleLogout = async () => {
    try {
      await logoutAdmin();
    } catch (_) {}
    clearAuth();
    toast.info("Logged out successfully");
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
        fixed top-0 left-0 bottom-0 z-50 bg-[#07152B] text-slate-300 flex flex-col justify-between transition-all duration-300 ease-in-out border-r border-slate-800
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${isCollapsed ? "lg:w-20" : "lg:w-64"} w-64
      `}
      >
        {/* Top Header */}
        <div>
          <div
            className={`flex items-center justify-between p-4 border-b border-slate-800/80 ${isCollapsed ? "lg:justify-center" : ""}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold shadow-lg flex-shrink-0">
                <Stethoscope className="w-6 h-6 text-blue-400" />
              </div>
              <div className={isCollapsed ? "lg:hidden" : "block"}>
                <h1 className="font-bold text-white text-sm sm:text-base tracking-tight leading-none truncate">
                  {user?.name || "Dr. Vinish Kumar Singh"}
                </h1>
                <p className="text-[11px] text-blue-400 font-semibold mt-1 truncate capitalize">
                  {role === "admin" ? "Administrator Portal" : "Doctor Portal"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <div className="px-3 pt-2 pb-4 space-y-2 overflow-y-auto max-h-[calc(100vh-130px)] notification-scrollbar">
            {/* MAIN MENU Section */}
            <div>
              {role === "admin" && (
                <div
                  className={`px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ${isCollapsed ? "lg:hidden" : ""}`}
                >
                  Main Menu
                </div>
              )}
              <div className="space-y-1">
                {/* Dashboard */}
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/admin"}
                      title={item.label}
                      onClick={() => onClose && onClose()}
                      className={({ isActive }) => `
                        flex items-center ${isCollapsed ? "lg:justify-center" : "justify-between"} px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                        ${
                          isActive
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold"
                            : "text-slate-200 hover:text-white hover:bg-slate-800/80"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-slate-300 group-hover:text-white transition-transform group-hover:scale-110 flex-shrink-0" />
                        <span className={isCollapsed ? "lg:hidden" : "block"}>
                          {item.label}
                        </span>
                      </div>
                    </NavLink>
                  );
                })}

                {/* Website Dropdown Header */}
                {role === "admin" && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setOpenMenu((prev) => (prev === "website" ? null : "website"))}
                      className={`w-full flex items-center ${
                        isCollapsed ? "lg:justify-center" : "justify-between"
                      } px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                        isWebsiteActive
                          ? "bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-sm"
                          : "text-slate-200 hover:text-white hover:bg-slate-800/80 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Globe className={`w-5 h-5 transition-transform group-hover:scale-110 flex-shrink-0 ${isWebsiteActive ? "text-blue-400" : "text-slate-300 group-hover:text-white"}`} />
                        <span className={isCollapsed ? "lg:hidden" : "block"}>
                          Website
                        </span>
                      </div>
                      <div className={isCollapsed ? "lg:hidden" : "block"}>
                        {isWebsiteOpen ? (
                          <ChevronDown className={`w-4 h-4 ${isWebsiteActive ? "text-blue-400" : "text-slate-400 group-hover:text-white"}`} />
                        ) : (
                          <ChevronRight className={`w-4 h-4 ${isWebsiteActive ? "text-blue-400" : "text-slate-400 group-hover:text-white"}`} />
                        )}
                      </div>
                    </button>

                    {/* Submenu List with Tree Line */}
                    {isWebsiteOpen && (
                      <div
                        className={`mt-1 space-y-1 transition-all duration-200 ${
                          isCollapsed
                            ? "lg:pl-0"
                            : "ml-6 pl-3 border-l border-slate-700/70"
                        }`}
                      >
                        {websiteNavItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <NavLink
                              key={item.path}
                              to={item.path}
                              title={item.label}
                              onClick={() => onClose && onClose()}
                              className={({ isActive }) => `
                                flex items-center ${
                                  isCollapsed ? "lg:justify-center" : "justify-between"
                                } px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 group relative
                                ${
                                  !isCollapsed ? "before:content-[''] before:absolute before:-left-[13px] before:top-1/2 before:-translate-y-1/2 before:w-2.5 before:h-[1px] before:bg-slate-700/80" : ""
                                }
                                ${
                                  isActive
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold"
                                    : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                                }
                              `}
                            >
                              <div className="flex items-center gap-2.5">
                                <Icon className="w-4.5 h-4.5 text-slate-300 group-hover:text-white transition-transform group-hover:scale-110 flex-shrink-0" />
                                <span className={isCollapsed ? "lg:hidden" : "block"}>
                                  {item.label}
                                </span>
                              </div>
                              {item.badge !== undefined && item.badge !== null && (
                                <span
                                  className={`px-2 py-0.5 text-xs font-bold rounded-full bg-blue-500/30 text-blue-300 border border-blue-400/20 ${
                                    isCollapsed ? "lg:hidden" : ""
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              )}
                              {item.badge !== undefined &&
                                item.badge !== null &&
                                isCollapsed && (
                                  <span className="hidden lg:block absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-400"></span>
                                )}
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Patient Management Dropdown Header */}
                {role === "admin" && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setOpenMenu((prev) => (prev === "patientManagement" ? null : "patientManagement"))}
                      className={`w-full flex items-center ${
                        isCollapsed ? "lg:justify-center" : "justify-between"
                      } px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                        isPatientManagementActive
                          ? "bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-sm"
                          : "text-slate-200 hover:text-white hover:bg-slate-800/80 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <UserPlus className={`w-5 h-5 transition-transform group-hover:scale-110 flex-shrink-0 ${isPatientManagementActive ? "text-blue-400" : "text-slate-300 group-hover:text-white"}`} />
                        <span className={isCollapsed ? "lg:hidden" : "block"}>
                          Patient Management
                        </span>
                      </div>
                      <div className={isCollapsed ? "lg:hidden" : "block"}>
                        {isPatientManagementOpen ? (
                          <ChevronDown className={`w-4 h-4 ${isPatientManagementActive ? "text-blue-400" : "text-slate-400 group-hover:text-white"}`} />
                        ) : (
                          <ChevronRight className={`w-4 h-4 ${isPatientManagementActive ? "text-blue-400" : "text-slate-400 group-hover:text-white"}`} />
                        )}
                      </div>
                    </button>

                    {/* Submenu List with Tree Line */}
                    {isPatientManagementOpen && (
                      <div
                        className={`mt-1 space-y-1 transition-all duration-200 ${
                          isCollapsed
                            ? "lg:pl-0"
                            : "ml-6 pl-3 border-l border-slate-700/70"
                        }`}
                      >
                        {/* 1. Appointments (with nested sub-items) */}
                        <div>
                          <button
                            type="button"
                            onClick={() => setIsAppointmentsSubOpen((prev) => !prev)}
                            className={`w-full flex items-center ${
                              isCollapsed ? "lg:justify-center" : "justify-between"
                            } px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                              !isCollapsed ? "before:content-[''] before:absolute before:-left-[13px] before:top-1/2 before:-translate-y-1/2 before:w-2.5 before:h-[1px] before:bg-slate-700/80" : ""
                            } ${
                              location.pathname.startsWith("/admin/appointments") || location.pathname.startsWith("/admin/All-Appointments")
                                ? "bg-blue-600/15 text-blue-300 font-semibold border border-blue-500/25"
                                : "text-slate-200 hover:text-white hover:bg-slate-800/70 border border-transparent"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Calendar className={`w-4.5 h-4.5 flex-shrink-0 ${
                                location.pathname.startsWith("/admin/appointments") || location.pathname.startsWith("/admin/All-Appointments") ? "text-blue-400" : "text-slate-300 group-hover:text-white"
                              }`} />
                              <span className={isCollapsed ? "lg:hidden" : "block"}>
                                Appointments
                              </span>
                            </div>
                            <div className={isCollapsed ? "lg:hidden" : "block"}>
                              {isAppointmentsSubOpen ? (
                                <ChevronDown className={`w-3.5 h-3.5 ${
                                  location.pathname.startsWith("/admin/appointments") || location.pathname.startsWith("/admin/All-Appointments") ? "text-blue-400" : "text-slate-400 group-hover:text-white"
                                }`} />
                              ) : (
                                <ChevronRight className={`w-3.5 h-3.5 ${
                                  location.pathname.startsWith("/admin/appointments") || location.pathname.startsWith("/admin/All-Appointments") ? "text-blue-400" : "text-slate-400 group-hover:text-white"
                                }`} />
                              )}
                            </div>
                          </button>

                          {/* Nested 2nd Level: Online Appointment & All Appointments */}
                          {isAppointmentsSubOpen && (
                            <div
                              className={`mt-1 space-y-1 transition-all duration-200 ${
                                isCollapsed ? "lg:pl-0" : "ml-3.5 pl-2.5 border-l border-slate-700/60"
                              }`}
                            >
                              <NavLink
                                to="/admin/appointments"
                                title="Online Appointment"
                                end
                                onClick={() => onClose && onClose()}
                                className={({ isActive }) => `
                                  flex items-center ${
                                    isCollapsed ? "lg:justify-center" : "justify-between"
                                  } px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 group relative
                                  ${
                                    !isCollapsed ? "before:content-[''] before:absolute before:-left-[11px] before:top-1/2 before:-translate-y-1/2 before:w-2 before:h-[1px] before:bg-slate-700/80" : ""
                                  }
                                  ${
                                    isActive
                                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold"
                                      : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                                  }
                                `}
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <Globe className="w-4 h-4 text-slate-400 group-hover:text-white flex-shrink-0" />
                                  <span className={isCollapsed ? "lg:hidden" : "block whitespace-nowrap"}>
                                    Online Appointment
                                  </span>
                                </div>
                              </NavLink>

                              <NavLink
                                to="/admin/All-Appointments"
                                title="All Appointments"
                                end
                                onClick={() => onClose && onClose()}
                                className={({ isActive }) => `
                                  flex items-center ${
                                    isCollapsed ? "lg:justify-center" : "justify-between"
                                  } px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 group relative
                                  ${
                                    !isCollapsed ? "before:content-[''] before:absolute before:-left-[11px] before:top-1/2 before:-translate-y-1/2 before:w-2 before:h-[1px] before:bg-slate-700/80" : ""
                                  }
                                  ${
                                    isActive
                                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold"
                                      : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                                  }
                                `}
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <CalendarCheck className="w-4 h-4 text-slate-400 group-hover:text-white flex-shrink-0" />
                                  <span className={isCollapsed ? "lg:hidden" : "block whitespace-nowrap"}>
                                    All Appointments
                                  </span>
                                </div>
                              </NavLink>
                            </div>
                          )}
                        </div>

                        {/* 2. Check-In */}
                        <NavLink
                          to="/admin/check-in"
                          title="Check-In"
                          onClick={() => onClose && onClose()}
                          className={({ isActive }) => `
                            flex items-center ${
                              isCollapsed ? "lg:justify-center" : "justify-between"
                            } px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 group relative
                            ${
                              !isCollapsed ? "before:content-[''] before:absolute before:-left-[13px] before:top-1/2 before:-translate-y-1/2 before:w-2.5 before:h-[1px] before:bg-slate-700/80" : ""
                            }
                            ${
                              isActive
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold"
                                : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                            }
                          `}
                        >
                          <div className="flex items-center gap-2.5">
                            <UserCheck className="w-4.5 h-4.5 text-emerald-400 group-hover:text-white flex-shrink-0" />
                            <span className={isCollapsed ? "lg:hidden" : "block"}>
                              Check-In
                            </span>
                          </div>
                        </NavLink>

                        {/* 3. OPD Management */}
                        <NavLink
                          to="/admin/opd-management"
                          title="OPD Management"
                          onClick={() => onClose && onClose()}
                          className={({ isActive }) => `
                            flex items-center ${
                              isCollapsed ? "lg:justify-center" : "justify-between"
                            } px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 group relative
                            ${
                              !isCollapsed ? "before:content-[''] before:absolute before:-left-[13px] before:top-1/2 before:-translate-y-1/2 before:w-2.5 before:h-[1px] before:bg-slate-700/80" : ""
                            }
                            ${
                              isActive
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold"
                                : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                            }
                          `}
                        >
                          <div className="flex items-center gap-2.5">
                            <Stethoscope className="w-4.5 h-4.5 text-blue-400 group-hover:text-white flex-shrink-0" />
                            <span className={isCollapsed ? "lg:hidden" : "block"}>
                              OPD Management
                            </span>
                          </div>
                          
                        </NavLink>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
                {/* Billing Management Dropdown Header */}
                {role === "admin" && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setOpenMenu((prev) => (prev === "billing" ? null : "billing"))}
                      className={`w-full flex items-center ${
                        isCollapsed ? "lg:justify-center" : "justify-between"
                      } px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                        isBillingActive
                          ? "bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-sm"
                          : "text-slate-200 hover:text-white hover:bg-slate-800/80 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Receipt className={`w-5 h-5 transition-transform group-hover:scale-110 flex-shrink-0 ${isBillingActive ? "text-blue-400" : "text-slate-300 group-hover:text-white"}`} />
                        <span className={isCollapsed ? "lg:hidden" : "block"}>
                          Billing management
                        </span>
                      </div>
                      <div className={isCollapsed ? "lg:hidden" : "block"}>
                        {isBillingOpen ? (
                          <ChevronDown className={`w-4 h-4 ${isBillingActive ? "text-blue-400" : "text-slate-400 group-hover:text-white"}`} />
                        ) : (
                          <ChevronRight className={`w-4 h-4 ${isBillingActive ? "text-blue-400" : "text-slate-400 group-hover:text-white"}`} />
                        )}
                      </div>
                    </button>

                    {/* Submenu List with Tree Line */}
                    {isBillingOpen && (
                      <div
                        className={`mt-1 space-y-1 transition-all duration-200 ${
                          isCollapsed
                            ? "lg:pl-0"
                            : "ml-6 pl-3 border-l border-slate-700/70"
                        }`}
                      >
                        {billingNavItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <NavLink
                              key={item.path}
                              to={item.path}
                              title={item.label}
                              onClick={() => onClose && onClose()}
                              className={({ isActive }) => `
                                flex items-center ${
                                  isCollapsed ? "lg:justify-center" : "justify-between"
                                } px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 group relative
                                ${
                                  !isCollapsed ? "before:content-[''] before:absolute before:-left-[13px] before:top-1/2 before:-translate-y-1/2 before:w-2.5 before:h-[1px] before:bg-slate-700/80" : ""
                                }
                                ${
                                  isActive
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold"
                                    : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                                }
                              `}
                            >
                              <div className="flex items-center gap-2.5">
                                <Icon className="w-4.5 h-4.5 text-slate-300 group-hover:text-white transition-transform group-hover:scale-110 flex-shrink-0" />
                                <span className={isCollapsed ? "lg:hidden" : "block"}>
                                  {item.label}
                                </span>
                              </div>
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

            {/* RECEPTION SERVICES Section */}
            <div>
              {/* {role === "admin" && (
                <div
                  className={`px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ${isCollapsed ? "lg:hidden" : ""}`}
                >
                  Reception Services
                </div>
              )} */}

              <div className="space-y-1">
                {/* Reception Top items */}
                {receptionNavItemsTop.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      title={item.label}
                      onClick={() => onClose && onClose()}
                      className={({ isActive }) => `
                        flex items-center ${isCollapsed ? "lg:justify-center" : "justify-between"} px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                        ${
                          isActive
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold"
                            : "text-slate-200 hover:text-white hover:bg-slate-800/80"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-slate-300 group-hover:text-white transition-transform group-hover:scale-110 flex-shrink-0" />
                        <span className={isCollapsed ? "lg:hidden" : "block"}>
                          {item.label}
                        </span>
                      </div>
                    </NavLink>
                  );
                })}

                

                {/* Reception Bottom items */}
                {receptionNavItemsBottom.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      title={item.label}
                      onClick={() => onClose && onClose()}
                      className={({ isActive }) => `
                        flex items-center ${isCollapsed ? "lg:justify-center" : "justify-between"} px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                        ${
                          isActive
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold"
                            : "text-slate-200 hover:text-white hover:bg-slate-800/80"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-slate-300 group-hover:text-white transition-transform group-hover:scale-110 flex-shrink-0" />
                        <span className={isCollapsed ? "lg:hidden" : "block"}>
                          {item.label}
                        </span>
                      </div>
                    </NavLink>
                  );
                })}
              </div>
            </div>
            {/* DOCTOR SERVICES Section */}
            {role === "doctor" && (
              <div>
                <div
                  className={`px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ${
                    isCollapsed ? "lg:hidden" : ""
                  }`}
                >
                  Doctor Services
                </div>

                <div className="space-y-1">
                  {doctorNavItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === "/doctor"}
                        title={item.label}
                        onClick={() => onClose && onClose()}
                        className={({ isActive }) => `
              flex items-center ${
                isCollapsed ? "lg:justify-center" : "justify-between"
              } px-3.5 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-200 group relative
              ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold"
                  : "text-slate-200 hover:text-white hover:bg-slate-800/80"
              }
            `}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-slate-300 group-hover:text-white transition-transform group-hover:scale-110 flex-shrink-0" />

                          <span className={isCollapsed ? "lg:hidden" : "block"}>
                            {item.label}
                          </span>
                        </div>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-3 border-t border-slate-800/80 bg-[#050f20]">
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Logout"
            className={`w-full flex items-center ${isCollapsed ? "lg:justify-center" : ""} gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:text-rose-400 hover:bg-rose-500/10 transition-colors`}
          >
            <LogOut className="w-5 h-5 text-slate-300 flex-shrink-0" />
            <span className={isCollapsed ? "lg:hidden" : "block"}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
