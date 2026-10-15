import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // --- Mentor Auth State ---
  const [mentor, setMentor] = useState(() => {
    try {
      const saved = localStorage.getItem('piet_mentor_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('piet_mentor_token'));

  // --- Student Auth State ---
  const [student, setStudent] = useState(() => {
    try {
      const saved = localStorage.getItem('piet_student_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [studentToken, setStudentToken] = useState(() => localStorage.getItem('piet_student_token'));

  const [loading, setLoading] = useState(true);

  // Verify mentor token on startup
  useEffect(() => {
    if (token) {
      axios.get('/api/mentor/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (res.data.success) {
          setMentor(res.data.mentor);
        }
      })
      .catch(() => logoutMentor())
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  // Verify student token on startup
  useEffect(() => {
    if (studentToken) {
      axios.get('/api/students/me', {
        headers: { Authorization: `Bearer ${studentToken}` }
      })
      .then(res => {
        if (res.data.success) {
          setStudent(res.data.student);
        }
      })
      .catch(() => studentLogout());
    }
  }, [studentToken]);

  // --- Mentor Login & Logout ---
  const login = async (identifier, password) => {
    try {
      const res = await axios.post('/api/mentor/login', { identifier, password });
      if (res.data.success) {
        const { token: newToken, mentor: mentorData } = res.data;
        setToken(newToken);
        setMentor(mentorData);
        localStorage.setItem('piet_mentor_token', newToken);
        localStorage.setItem('piet_mentor_user', JSON.stringify(mentorData));
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please verify credentials.'
      };
    }
  };

  const logoutMentor = () => {
    setToken(null);
    setMentor(null);
    localStorage.removeItem('piet_mentor_token');
    localStorage.removeItem('piet_mentor_user');
  };

  // --- Student Registration, Login & Logout ---
  const studentRegister = async (studentPayload) => {
    try {
      const res = await axios.post('/api/students/register', studentPayload);
      if (res.data.success) {
        const { token: newStudentToken, student: studentData } = res.data;
        setStudentToken(newStudentToken);
        setStudent(studentData);
        localStorage.setItem('piet_student_token', newStudentToken);
        localStorage.setItem('piet_student_user', JSON.stringify(studentData));
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed. Please check details.'
      };
    }
  };

  const studentLogin = async (identifier, password) => {
    try {
      const res = await axios.post('/api/students/login', { identifier, password });
      if (res.data.success) {
        const { token: newStudentToken, student: studentData } = res.data;
        setStudentToken(newStudentToken);
        setStudent(studentData);
        localStorage.setItem('piet_student_token', newStudentToken);
        localStorage.setItem('piet_student_user', JSON.stringify(studentData));
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message, needsPasswordSetup: res.data.needsPasswordSetup };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Invalid college email or password.',
        needsPasswordSetup: err.response?.data?.needsPasswordSetup
      };
    }
  };

  const studentLogout = () => {
    setStudentToken(null);
    setStudent(null);
    localStorage.removeItem('piet_student_token');
    localStorage.removeItem('piet_student_user');
  };

  return (
    <AuthContext.Provider
      value={{
        // Mentor
        mentor,
        token,
        login,
        logout: logoutMentor,
        isAuthenticated: !!token,

        // Student
        student,
        setStudent,
        studentToken,
        studentLogin,
        studentRegister,
        studentLogout,
        isStudentAuthenticated: !!studentToken,

        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
