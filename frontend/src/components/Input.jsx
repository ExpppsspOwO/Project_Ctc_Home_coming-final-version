import React from 'react';
const Input = ({ 
  type = "text", 
  name, 
  value, 
  onChange, 
  placeholder, 
  error,       
  ...props 
}) => {
  return (
    <div className="relative w-full mb-6"> 
      
      {/* 1. ตัว Input */}
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        className={`
          peer 
          w-full 
          h-12 
          px-4 
          pt-2
          bg-white /* ✅ บังคับพื้นขาว */
          border-2 
          rounded-lg 
          outline-none 
          transition-all 
          duration-200
          placeholder-transparent 
          ${error 
            ? 'border-red-500 focus:border-red-500 text-red-900' 
            : 'border-gray-200 focus:border-blue-500 text-gray-700' 
          }
        `}
        placeholder={placeholder} 
        {...props}
      />

      {/* 2. ตัว Label */}
      <label
        htmlFor={name}
        className={`
          absolute 
          left-4 
          transition-all 
          duration-200 
          pointer-events-none
          px-1
          bg-white /* ✅ พื้นหลังขาว */

          /* สถานะปกติ (ลอย) */
          -top-2.5 
          text-sm 
          ${error ? 'text-red-500' : 'text-blue-500'}

          /* สถานะว่าง (จม) */
          peer-placeholder-shown:top-3
          peer-placeholder-shown:text-base
          peer-placeholder-shown:text-gray-400
          peer-placeholder-shown:bg-transparent

          /* สถานะ Focus (ลอยเสมอ) */
          peer-focus:-top-2.5 
          peer-focus:text-sm 
          peer-focus:bg-white
          ${error ? 'peer-focus:text-red-500' : 'peer-focus:text-blue-500'}
        `}
      >
        {placeholder}
      </label>

      {/* 3. Error Message */}
      {error && (
        <p className="absolute -bottom-5 left-0 text-xs text-red-500 font-medium animate-shake">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;