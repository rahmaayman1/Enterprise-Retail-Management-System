import React, { useState } from "react";

const Settings = () => {
  const [userData, setUserData] = useState({
    name: "Rahma Ayman",
    email: "rahma@example.com",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");

  // تحديث بيانات الحساب
  const handleUserUpdate = (e) => {
    e.preventDefault();
    setMessage("User information updated successfully!");
  };

  // تغيير كلمة السر
  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage("New password and confirm password do not match.");
      return;
    }
    setMessage("Password updated successfully!");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Settings</h1>

      {message && (
        <div className="bg-green-100 text-green-800 p-3 mb-6 rounded">
          {message}
        </div>
      )}

      {/* تحديث بيانات المستخدم */}
      <div className="bg-white shadow-lg rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Update Profile
        </h2>
        <form onSubmit={handleUserUpdate}>
          <input
            type="text"
            placeholder="Name"
            value={userData.name}
            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
            className="w-full p-3 mb-4 border rounded"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={userData.email}
            onChange={(e) =>
              setUserData({ ...userData, email: e.target.value })
            }
            className="w-full p-3 mb-4 border rounded"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition"
          >
            Update Profile
          </button>
        </form>
      </div>

      {/* تغيير كلمة السر */}
      <div className="bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Change Password</h2>
        <form onSubmit={handlePasswordUpdate}>
          <input
            type="password"
            placeholder="Current Password"
            value={passwordData.currentPassword}
            onChange={(e) =>
              setPasswordData({ ...passwordData, currentPassword: e.target.value })
            }
            className="w-full p-3 mb-4 border rounded"
            required
          />
          <input
            type="password"
            placeholder="New Password"
            value={passwordData.newPassword}
            onChange={(e) =>
              setPasswordData({ ...passwordData, newPassword: e.target.value })
            }
            className="w-full p-3 mb-4 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={passwordData.confirmPassword}
            onChange={(e) =>
              setPasswordData({ ...passwordData, confirmPassword: e.target.value })
            }
            className="w-full p-3 mb-4 border rounded"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
