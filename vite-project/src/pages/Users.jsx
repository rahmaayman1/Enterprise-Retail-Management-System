import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Mail, 
  Phone, 
  Shield, 
  Calendar,
  AlertCircle,
  CheckCircle,
  X,
  RefreshCw,
  UserCheck,
  UserX,
  Settings,
  Lock,
  Unlock,
  MoreVertical,
  Building
} from 'lucide-react';

// Import real services
import { userService } from '../services/userService';
import { branchService } from '../services/branchService';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const roles = ['Admin', 'Manager', 'Accountant', 'Cashier', 'Warehouse Staff'];

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    await Promise.all([
      fetchUsers(),
      fetchBranches()
    ]);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const data = await branchService.getActiveBranches();
      setBranches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching branches:', err);
      setBranches([]);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      setActionLoading(true);
      await userService.deleteUser(userId);
      setUsers(users.filter(u => u._id !== userId));
      alert('User deleted successfully!');
    } catch (err) {
      alert('Failed to delete user: ' + (err.message || 'Unknown error'));
      console.error('Delete error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const UserModal = ({ isEdit = false, user = null, onClose, onSave }) => {
    const [formData, setFormData] = useState({
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      confirmPassword: '',
      role: user?.role || 'Cashier',
      branch: user?.branch?._id || user?.branch || ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validateForm = () => {
      const errors = {};
      
      if (!formData.name.trim()) {
        errors.name = 'Name is required';
      }
      
      if (!formData.email.trim()) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }

      // Check if email already exists (excluding current user in edit mode)
      const emailExists = users.some(u => 
        u.email.toLowerCase() === formData.email.toLowerCase() && 
        (!isEdit || u._id !== user._id)
      );
      if (emailExists) {
        errors.email = 'Email already exists';
      }
      
      if (!isEdit || formData.password) {
        if (!formData.password) {
          errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
          errors.password = 'Password must be at least 6 characters long';
        }
        
        if (formData.password !== formData.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        }
      }

      if (!formData.role) {
        errors.role = 'Role is required';
      }

      setValidationErrors(errors);
      return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!validateForm()) return;

      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        branch: formData.branch || undefined
      };

      // Only include password if it's provided
      if (formData.password) {
        userData.password = formData.password;
      }

      try {
        setSubmitting(true);
        let result;
        
        if (isEdit && user) {
          result = await userService.updateUser(user._id, userData);
        } else {
          result = await userService.createUser(userData);
        }
        
        alert(`User ${isEdit ? 'updated' : 'created'} successfully!`);
        onSave?.();
        onClose();
        await fetchUsers(); // Refresh the users list
      } catch (error) {
        console.error('Submit error:', error);
        alert(error.message || `Failed to ${isEdit ? 'update' : 'create'} user`);
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEdit ? 'Edit User' : 'Add New User'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 ${
                  validationErrors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter full name"
              />
              {validationErrors.name && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 ${
                  validationErrors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
              />
              {validationErrors.email && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password {isEdit ? '' : '*'}
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className={`w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:border-teal-500 ${
                    validationErrors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={isEdit ? "Leave empty to keep current password" : "Enter password"}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
              )}
            </div>

            {(!isEdit || formData.password) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className={`w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:border-teal-500 ${
                      validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Confirm password"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 ${
                  validationErrors.role ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              {validationErrors.role && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.role}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch
              </label>
              <select
                value={formData.branch || ''}
                onChange={(e) => setFormData({...formData, branch: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
              >
                <option value="">Select Branch (Optional)</option>
                {branches.map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.name} ({branch.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button 
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                {submitting ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update User' : 'Create User')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Admin':
        return <Shield className="w-4 h-4 text-red-600" />;
      case 'Manager':
        return <UserCheck className="w-4 h-4 text-purple-600" />;
      case 'Accountant':
        return <Settings className="w-4 h-4 text-blue-600" />;
      case 'Cashier':
        return <Users className="w-4 h-4 text-green-600" />;
      case 'Warehouse Staff':
        return <UserX className="w-4 h-4 text-orange-600" />;
      default:
        return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-800';
      case 'Manager':
        return 'bg-purple-100 text-purple-800';
      case 'Accountant':
        return 'bg-blue-100 text-blue-800';
      case 'Cashier':
        return 'bg-green-100 text-green-800';
      case 'Warehouse Staff':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const UserRow = ({ user }) => {
    const branchName = typeof user.branch === 'object' 
      ? user.branch?.name 
      : branches.find(b => b._id === user.branch)?.name || 'Not Assigned';

    return (
      <tr className="border-b border-gray-200 hover:bg-gray-50">
        <td className="py-3 px-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              <span className="text-teal-700 font-semibold text-sm">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500 flex items-center">
                <Mail className="w-3 h-3 mr-1" />
                {user.email}
              </p>
            </div>
          </div>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center">
            {getRoleIcon(user.role)}
            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(user.role)}`}>
              {user.role}
            </span>
          </div>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center text-sm text-gray-600">
            <Building className="w-3 h-3 mr-1" />
            {branchName}
          </div>
        </td>
        <td className="py-3 px-4">
          <span className="text-sm text-gray-600">
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
          </span>
        </td>
        <td className="py-3 px-4">
          <span className="text-sm text-gray-600">
            {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
          </span>
        </td>
        <td className="py-3 px-4">
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            Active
          </span>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => {
                setSelectedUser(user);
                setShowEditModal(true);
              }}
              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
              title="Edit User"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleDeleteUser(user._id)}
              className="p-1 text-red-600 hover:bg-red-100 rounded disabled:opacity-50"
              disabled={actionLoading}
              title="Delete User"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  // Enhanced filter function
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || [
      user.name,
      user.email,
      user.role
    ].some(field => 
      field?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesRole = !roleFilter || user.role === roleFilter;

    const userBranchId = typeof user.branch === 'object' ? user.branch?._id : user.branch;
    const matchesBranch = !branchFilter || userBranchId === branchFilter;

    return matchesSearch && matchesRole && matchesBranch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertCircle className="w-6 h-6 text-red-400" />
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-800">Error Loading Users</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button 
              onClick={fetchUsers}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center text-sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600">Manage system users and their permissions</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or role..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 min-w-[120px]"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              {roles.map(role => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 min-w-[120px]"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
            >
              <option value="">All Branches</option>
              {branches.map(branch => (
                <option key={branch._id} value={branch._id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Results summary */}
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Users Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-lg font-semibold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Admins</p>
              <p className="text-lg font-semibold text-gray-900">
                {users.filter(u => u.role === 'Admin').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Cashiers</p>
              <p className="text-lg font-semibold text-gray-900">
                {users.filter(u => u.role === 'Cashier').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Managers</p>
              <p className="text-lg font-semibold text-gray-900">
                {users.filter(u => u.role === 'Manager').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Branch</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Last Updated</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <UserRow key={user._id} user={user} />
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-500">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    {users.length === 0 ? (
                      <div>
                        <p className="text-lg font-medium text-gray-900 mb-2">No Users</p>
                        <p className="text-sm text-gray-500 mb-4">Start by adding your first user</p>
                        <button 
                          onClick={() => setShowAddModal(true)}
                          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 inline-flex items-center"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add New User
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg font-medium text-gray-900 mb-2">No Users Found</p>
                        <p className="text-sm text-gray-500">Try adjusting your search or filter criteria</p>
                        <button 
                          onClick={() => {
                            setSearchTerm('');
                            setRoleFilter('');
                            setBranchFilter('');
                          }}
                          className="mt-3 px-4 py-2 text-teal-600 border border-teal-600 rounded-lg hover:bg-teal-50 inline-flex items-center"
                        >
                          Reset Filters
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {filteredUsers.length > 0 && (
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredUsers.length}</span> of{' '}
                <span className="font-medium">{users.length}</span> users
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">
                  Total roles: {new Set(users.map(u => u.role)).size}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <UserModal 
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            setShowAddModal(false);
          }}
        />
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <UserModal 
          isEdit={true}
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSave={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

export default UsersPage;