import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { FaTimes } from 'react-icons/fa';
import EditTeacherModal from './EditTeacherModal';
import TeachersList from './TeachersList';

const AddTeachers = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    gmail: '',
    password: '',
    phoneNumber: '',
    branch: '',
    teacherID: '',
    role: '',
  });

  const [teachers, setTeachers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const role = sessionStorage.getItem('role');
  const userBranch = sessionStorage.getItem('branch');

  useEffect(() => {
    const fetchBranches = async () => {
      const response = await fetch(process.env.REACT_APP_BASE_URL + '/branches')
      const data = await response.json();
      setBranches(data);
    };

    fetchBranches();
  }, []);

  useEffect(() => {
    const fetchTeachers = async () => {
      const response = await fetch(process.env.REACT_APP_BASE_URL + '/teachers');
      const data = await response.json();

      let branchFilteredTeachers = role === 'admin' ? data : data.filter(teacher => teacher.branch === userBranch);

      let roleFilteredTeachers = [];
      switch (role) {
        case 'admin':
          roleFilteredTeachers = branchFilteredTeachers;
          break;
        case 'director':
          roleFilteredTeachers = branchFilteredTeachers.filter(teacher => teacher.role !== 'admin');
          break;
        case 'vice president':
          roleFilteredTeachers = branchFilteredTeachers.filter(teacher =>
            teacher.role === 'teacher' || teacher.role === 'receptionist' || teacher.role === 'vice president'
          );
          break;
        default:
          roleFilteredTeachers = branchFilteredTeachers;
          break;
      }

      setTeachers(roleFilteredTeachers);
    };

    fetchTeachers();
  }, [role, userBranch]);

  const handleChange = (e) => {
    if (e.target.name === 'phoneNumber') {
      const value = e.target.value.replace(/\D/g, '');
      if (value.length <= 10) {
        setForm({
          ...form,
          [e.target.name]: value
        });
      }
    } else {
      setForm({
        ...form,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = { ...form };

    if (role !== 'admin') {
      formData.branch = userBranch;
    }

    try {
      const response = await fetch(process.env.REACT_APP_BASE_URL + '/teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const newTeacher = await response.json();
      if (response.ok) {
        window.location.reload();
        setForm({ name: '', email: '', gmail: '', password: '', phoneNumber: '', branch: '', teacherID: '', role: '' });
        alert('User added successfully!');
      } else {
        throw new Error(newTeacher.error || 'Failed to add teacher');
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleRowClick = (teacher) => {
    setSelectedTeacher(teacher);
    setForm({
      name: teacher.name,
      email: teacher.email,
      gmail: teacher.gmail,
      password: '',
      phoneNumber: teacher.phoneNumber,
      branch: teacher.branch,
      teacherID: teacher.teacherID,
      role: teacher.role
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const formData = { ...form };
  
    if (role !== 'admin') {
      formData.branch = userBranch;
    }

    try {
      const response = await fetch(process.env.REACT_APP_BASE_URL + `/teachers/${selectedTeacher._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update teacher');
      }
  
      window.location.reload();
      setIsEditModalOpen(false);
      setForm({ name: '', email: '', gmail: '', phoneNumber: '', branch: '', teacherID: '', role: ''});
      alert('User updated successfully!');
    } catch (error) {
      console.error(error); // Log the error for debugging
      alert(error.message);
    }
  };
  

  const getAvailableRoles = () => {
    switch (role) {
      case 'admin':
        return ['admin', 'director', 'vice president', 'teacher', 'receptionist'];
      case 'director':
        return ['vice president', 'teacher', 'receptionist'];
      case 'vice president':
        return ['teacher', 'receptionist'];
      default:
        return [];
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex flex-col items-center justify-center mt-4 md:mt-8 p-2">
        <div className="w-full md:w-2/4 bg-gradient-to-br from-blue-100 to-blue-200 p-4 md:p-6 rounded-3xl shadow-lg mx-2">
          <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4 text-center text-[#2D5990]">ADD USER</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                className="input input-bordered w-full bg-white my-1 md:my-2 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="input input-bordered w-full bg-white my-1 md:my-2 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="input input-bordered w-full bg-white my-1 md:my-2 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="phoneNumber"
                placeholder="Phone Number"
                value={form.phoneNumber}
                onChange={handleChange}
                className="input input-bordered w-full bg-white my-1 md:my-2 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                name="gmail"
                placeholder="Gmail"
                value={form.gmail}
                onChange={handleChange}
                className="input input-bordered w-full bg-white my-1 md:my-2 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-blue-500"
              />
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="input input-bordered w-full bg-white text-black my-1 md:my-2 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Role</option>
                {getAvailableRoles().map((roleOption) => (
                  <option key={roleOption} value={roleOption}>
                    {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                  </option>
                ))}
              </select>
              {role === 'admin' ? (
                <select
                  name="branch"
                  value={form.branch}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-white text-black my-1 md:my-2 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch.name}>
                      {branch.branchCode}
                    </option>
                  ))}
                </select>
              ) : (
                <input type="hidden" name="branch" value={userBranch} />
              )}
              <input
                type="text"
                name="teacherID"
                placeholder="User ID"
                value={form.teacherID}
                onChange={handleChange}
                className="input input-bordered w-full bg-white my-1 md:my-2 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary mt-4 w-full md:w-auto bg-[#2D5990] hover:bg-[#00A0E3] text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105"
            >
              Add User
            </button>
          </form>
        </div>

        <TeachersList teachers={teachers} onRowClick={handleRowClick} />
      </div>

      <EditTeacherModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-center text-[#2D5990]">Edit User</h2>
        <form onSubmit={handleEditSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              className="input input-bordered w-full bg-white my-1 md:my-2 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="input input-bordered w-full bg-white my-1 md:my-2 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="phoneNumber"
              placeholder="Phone Number"
              value={form.phoneNumber}
              onChange={handleChange}
              className="input input-bordered w-full bg-white my-1 md:my-2 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              name="gmail"
              placeholder="Gmail"
              value={form.gmail}
              onChange={handleChange}
              className="input input-bordered w-full bg-white my-1 md:my-2 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-blue-500"
            />
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="input input-bordered w-full bg-white text-black my-1 md:my-2 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Role</option>
              {getAvailableRoles().map((roleOption) => (
                <option key={roleOption} value={roleOption}>
                  {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                </option>
              ))}
            </select>
            {role === 'admin' ? (
              <select
                name="branch"
                value={form.branch}
                onChange={handleChange}
                className="input input-bordered w-full bg-white text-black my-1 md:my-2 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch._id} value={branch.name}>
                    {branch.branchCode}
                  </option>
                ))}
              </select>
            ) : (
              <input type="hidden" name="branch" value={userBranch} />
            )}
            <input
              type="text"
              name="teacherID"
              placeholder="User ID"
              value={form.teacherID}
              onChange={handleChange}
              className="input input-bordered w-full bg-white my-1 md:my-2 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary mt-4 w-full md:w-auto bg-[#2D5990] hover:bg-[#00A0E3] text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105"
          >
            Update User
          </button>
        </form>
      </EditTeacherModal>
    </div>
  );
};

export default AddTeachers;
