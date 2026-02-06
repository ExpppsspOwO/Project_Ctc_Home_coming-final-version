import React from 'react';

const Input = ({ label, value, onChange, type = "text", placeholder }) => (
  <div className="mb-4">
    {label && <label className="block text-sm text-gray-500 mb-1">{label}</label>}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full p-3 bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400 transition"
    />
  </div>
);

export default Input;