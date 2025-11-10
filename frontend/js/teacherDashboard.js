// Modern Teacher Dashboard JavaScript
const API_BASE_URL = 'http://localhost:5000';

// Load teacher data from localStorage
    const teacher = JSON.parse(localStorage.getItem('teacher'));
    if (!teacher) {
        window.location.href = 'teacherLogin.html';
    throw new Error('Teacher not found');
}

// State management
let currentSection = 'profile';
let currentClassId = null;
let studentsData = [];

// Temporary assignment and submission data
const tempAssignmentsData = [
    {
        assignment_id: 1,
        title: "Mathematics Quiz - Chapter 5",
        description: "Complete the quiz on algebraic equations and functions",
        class_name: "Grade 10A",
        subject_name: "Mathematics",
        due_date: "2024-12-15T23:59:00",
        submissions: [
            {
                student_id: 1001,
                student_name: "Ahmed Hassan",
                submitted_at: "2024-12-10T14:30:00",
                status: "Submitted",
                file_path: "https://example.com/submissions/ahmed_math_quiz.pdf",
                grade: 85,
                feedback: "Good work! Minor calculation errors in question 3."
            },
            {
                student_id: 1002,
                student_name: "Fatima Al-Zahra",
                submitted_at: "2024-12-12T16:45:00",
                status: "Submitted",
                file_path: "https://example.com/submissions/fatima_math_quiz.pdf",
                grade: 92,
                feedback: "Excellent work! All answers are correct."
            },
            {
                student_id: 1003,
                student_name: "Omar Khaled",
                submitted_at: null,
                status: "Not Submitted",
                file_path: null,
                grade: null,
                feedback: null
            }
        ]
    },
    {
        assignment_id: 2,
        title: "Science Lab Report - Chemical Reactions",
        description: "Write a detailed report on the chemical reactions experiment conducted in class",
        class_name: "Grade 10A",
        subject_name: "Chemistry",
        due_date: "2024-12-20T23:59:00",
        submissions: [
            {
                student_id: 1001,
                student_name: "Ahmed Hassan",
                submitted_at: "2024-12-18T10:15:00",
                status: "Submitted",
                file_path: "https://example.com/submissions/ahmed_chemistry_report.docx",
                grade: 78,
                feedback: "Good observations, but needs more detailed analysis."
            },
            {
                student_id: 1002,
                student_name: "Fatima Al-Zahra",
                submitted_at: "2024-12-17T20:30:00",
                status: "Submitted",
                file_path: "https://example.com/submissions/fatima_chemistry_report.docx",
                grade: 95,
                feedback: "Outstanding report with excellent analysis and conclusions."
            },
            {
                student_id: 1004,
                student_name: "Layla Mohammed",
                submitted_at: "2024-12-19T22:45:00",
                status: "Late Submission",
                file_path: "https://example.com/submissions/layla_chemistry_report.docx",
                grade: 82,
                feedback: "Good work but submitted after deadline."
            }
        ]
    },
    {
        assignment_id: 3,
        title: "English Essay - Modern Literature",
        description: "Write a 500-word essay analyzing themes in modern Arabic literature",
        class_name: "Grade 11B",
        subject_name: "Arabic Literature",
        due_date: "2024-12-25T23:59:00",
        submissions: [
            {
                student_id: 1005,
                student_name: "Yusuf Ali",
                submitted_at: "2024-12-22T19:20:00",
                status: "Submitted",
                file_path: "https://example.com/submissions/yusuf_literature_essay.pdf",
                grade: 88,
                feedback: "Well-structured essay with good analysis of themes."
            },
            {
                student_id: 1006,
                student_name: "Nour Abdel Rahman",
                submitted_at: "2024-12-23T15:10:00",
                status: "Submitted",
                file_path: "https://example.com/submissions/nour_literature_essay.pdf",
                grade: 91,
                feedback: "Excellent essay with deep understanding of literary themes."
            }
        ]
    }
];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    setupEventListeners();
    loadProfileData();
});

// Initialize dashboard
function initializeDashboard() {
    updateTeacherInfo();
    showSection('profile');
}

// Update teacher information in sidebar
function updateTeacherInfo() {
    document.getElementById('teacherName').textContent = `${teacher.first_name || 'Teacher'} ${teacher.last_name || ''}`;
    document.getElementById('teacherId').textContent = `ID: ${teacher.user_id}`;
    document.getElementById('teacherSubject').textContent = `Subject: ${teacher.subject_teaches || 'N/A'}`;
}

// Setup event listeners
function setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.sidebar nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            
            if (href.startsWith('#')) {
                const sectionId = href.substring(1);
                showSection(sectionId);
                updateActiveNav(link);
            } else if (href.endsWith('.html')) {
                window.location.href = href;
            }
        });
    });

    // Header buttons
    document.getElementById('logoutButton').addEventListener('click', logout);
    
    // Section refresh buttons
    document.getElementById('refreshSchedule')?.addEventListener('click', () => loadSchedule());
    document.getElementById('refreshClasses')?.addEventListener('click', () => loadClasses());
    document.getElementById('refreshStudents')?.addEventListener('click', () => loadStudents());
    document.getElementById('refreshMaterials')?.addEventListener('click', () => loadMaterials());
    document.getElementById('refreshAssignments')?.addEventListener('click', () => loadAssignments());
    document.getElementById('refreshSubmissions')?.addEventListener('click', () => loadSubmissions());

    // Action buttons
    document.getElementById('backToClasses')?.addEventListener('click', () => showSection('classes'));
    document.getElementById('startAttendanceBtn')?.addEventListener('click', startAttendance);
    document.getElementById('uploadMaterialBtn')?.addEventListener('click', async () => {
        await loadClassesForSelect('material-class');
        await loadSubjectsForSelect('material-subject');
        if (currentClassId) {
            const classSelect = document.getElementById('material-class');
            classSelect.value = currentClassId;
        }
        openModal('materialModal');
    });
    document.getElementById('createAssignmentMainBtn')?.addEventListener('click', async () => {
        await loadClassesForSelect('assignment-class');
        await loadSubjectsForSelect('assignment-subject');
        if (currentClassId) {
            const classSelect = document.getElementById('assignment-class');
            classSelect.value = currentClassId;
        }
        openModal('assignmentModal');
    });
    
    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal.id);
        });
    });
    
    // Modal backdrop clicks
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Form submissions
    document.getElementById('materialForm')?.addEventListener('submit', handleMaterialSubmit);
    document.getElementById('assignmentForm')?.addEventListener('submit', handleAssignmentSubmit);
    document.getElementById('gradeForm')?.addEventListener('submit', handleGradeSubmit);
    document.getElementById('sendMaterialForm')?.addEventListener('submit', handleSendMaterialSubmit);
    document.getElementById('studentAssignmentForm')?.addEventListener('submit', handleStudentAssignmentSubmit);
    
    // Student modal action buttons
    document.getElementById('assignGradeBtn')?.addEventListener('click', () => showGradeModal());
    document.getElementById('sendMaterialBtn')?.addEventListener('click', () => showMaterialModal());
    document.getElementById('createAssignmentBtn')?.addEventListener('click', () => showAssignmentModal());
    document.getElementById('viewSubmissionsBtn')?.addEventListener('click', () => showSubmissionsModal());

    // Chat buttons
    document.getElementById('chatWithStudentBtn')?.addEventListener('click', () => chatWithStudent());
    document.getElementById('chatWithParentBtn')?.addEventListener('click', () => chatWithParent());

    // Fix Chat button to set user info and go to chat.html
    const chatBtn = document.getElementById('chatBtn');
    if (chatBtn) {
        chatBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.setItem('user', JSON.stringify({
                userId: teacher.user_id,
                userType: 'teacher',
                userName: `${teacher.first_name} ${teacher.last_name}`
            }));
            window.location.href = 'chat.html';
        });
    }
}

// Show section and hide others
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.add('section-hidden');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('section-hidden');
        currentSection = sectionId;
        
        // Load section data
        switch (sectionId) {
            case 'profile':
                loadProfileData();
                break;
            case 'schedule':
                loadSchedule();
                break;
            case 'classes':
                loadClasses();
                break;
            case 'students':
                if (currentClassId) {
                    loadStudents();
                }
                break;
            case 'materials':
                loadMaterials();
                break;
            case 'assignments':
                loadAssignments();
                break;
            case 'submissions':
                loadSubmissions();
                break;
        }
    }
}

// Update active navigation
function updateActiveNav(activeLink) {
    document.querySelectorAll('.sidebar nav li').forEach(li => {
        li.classList.remove('active');
    });
    activeLink.parentElement.classList.add('active');
}

// Load profile data
async function loadProfileData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/teacher/profile?teacher_id=${teacher.user_id}`);
        if (!response.ok) throw new Error('Failed to load profile');
        
        const profileData = await response.json();
        
        // Update profile information
        document.getElementById('profileName').textContent = `${profileData.first_name} ${profileData.last_name}`;
        document.getElementById('profileEmail').textContent = profileData.email || 'N/A';
        document.getElementById('profileSubject').textContent = profileData.subject_teaches || 'N/A';
        
        // Load stats
        loadTeacherStats();
        
    } catch (error) {
        console.error('Error loading profile:', error);
        showToast('Failed to load profile data', true);
    }
}

// Load teacher statistics
async function loadTeacherStats() {
    try {
        // Load classes count
        const classesResponse = await fetch(`${API_BASE_URL}/api/teacher/classes?teacher_id=${teacher.user_id}`);
        if (classesResponse.ok) {
            const classes = await classesResponse.json();
            document.getElementById('totalClasses').textContent = classes.length || 0;
        }
        
        // Load students count (approximate)
        const studentsResponse = await fetch(`${API_BASE_URL}/api/teacher/students?teacher_id=${teacher.user_id}`);
        if (studentsResponse.ok) {
            const students = await studentsResponse.json();
            document.getElementById('totalStudents').textContent = students.length || 0;
        }
        
        // Load assignments count
        const assignmentsResponse = await fetch(`${API_BASE_URL}/api/teacher/assignments?teacher_id=${teacher.user_id}`);
        if (assignmentsResponse.ok) {
            const assignments = await assignmentsResponse.json();
            document.getElementById('totalAssignments').textContent = assignments.length || 0;
        }
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load schedule
    async function loadSchedule() {
    const scheduleGrid = document.getElementById('schedule-grid');
    
        try {
        const response = await fetch(`${API_BASE_URL}/api/teacher/schedule?teacher_id=${teacher.user_id}`);
        if (!response.ok) throw new Error('Failed to load schedule');
        
            const schedule = await response.json();
            
            if (schedule.length === 0) {
            scheduleGrid.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-calendar-times" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <p>No schedule found</p>
                </div>
            `;
            return;
        }
        
        scheduleGrid.innerHTML = schedule.map(item => `
            <div class="schedule-card">
                <div class="card-header">
                    <i class="fas fa-clock"></i>
                    <h3>${item.class_name}</h3>
                </div>
                <div class="card-content">
                    <div class="schedule-info">
                        <p><strong>Subject:</strong> ${item.subject_name}</p>
                        <p><strong>Day:</strong> ${item.day_of_week}</p>
                        <p><strong>Period:</strong> ${item.period_number}</p>
                        <p><strong>Time:</strong> ${item.start_time} - ${item.end_time}</p>
                    </div>
                </div>
            </div>
        `).join('');
        
        } catch (error) {
            console.error('Error loading schedule:', error);
        scheduleGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle" style="color: #e74c3c; font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Failed to load schedule. Please try again.</p>
            </div>
        `;
    }
}

// Load classes
async function loadClasses() {
    const classesGrid = document.getElementById('classes-grid');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/teacher/classes?teacher_id=${teacher.user_id}`);
        if (!response.ok) throw new Error('Failed to load classes');
        
            const classes = await response.json();
            
            if (classes.length === 0) {
            classesGrid.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-users" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <p>No classes found</p>
                </div>
            `;
            return;
        }
        
        classesGrid.innerHTML = classes.map(cls => `
            <div class="class-card" onclick="selectClass(${cls.class_id}, '${cls.class_name}')">
                <div class="card-header">
                    <i class="fas fa-users"></i>
                    <h3>${cls.class_name}</h3>
                </div>
                <div class="card-content">
                    <p><strong>Class ID:</strong> ${cls.class_id}</p>
                    <div class="class-actions">
                        <button class="btn-primary" onclick="event.stopPropagation(); selectClass(${cls.class_id}, '${cls.class_name}')">
                            <i class="fas fa-graduation-cap"></i> View Students
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        } catch (error) {
            console.error('Error loading classes:', error);
        classesGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle" style="color: #e74c3c; font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Failed to load classes. Please try again.</p>
            </div>
        `;
    }
}

// Select class and show students
function selectClass(classId, className) {
    currentClassId = classId;
    document.getElementById('currentClassName').textContent = className;
    document.getElementById('classInfoCard').style.display = 'block';
    
    // Show students section and load students
    showSection('students');
    loadStudents();
}

// Load students for selected class
async function loadStudents() {
    if (!currentClassId) return;
    
    const studentsGrid = document.getElementById('students-grid');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/teacher/students?class_id=${currentClassId}`);
        if (!response.ok) throw new Error('Failed to load students');
        
            const students = await response.json();
        studentsData = students;
            
            if (students.length === 0) {
            studentsGrid.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-user-graduate" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <p>No students found in this class</p>
                </div>
            `;
            return;
        }
        
        studentsGrid.innerHTML = students.map(student => `
            <div class="student-card" onclick="showStudentDetails(${student.student_id})">
                <div class="card-header">
                    <i class="fas fa-user-graduate"></i>
                    <h3>${student.first_name} ${student.last_name}</h3>
                </div>
                <div class="card-content">
                    <p><strong>Student ID:</strong> ${student.student_id}</p>
                    <p><strong>Email:</strong> ${student.email}</p>
                </div>
            </div>
        `).join('');
        
        } catch (error) {
            console.error('Error loading students:', error);
        studentsGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle" style="color: #e74c3c; font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Failed to load students. Please try again.</p>
            </div>
        `;
    }
}

// Show student details modal
async function showStudentDetails(studentId) {
    const student = studentsData.find(s => s.student_id === studentId);
    if (!student) return;
    
    // Fetch parent info from backend
    let parentInfo = null;
    try {
        const response = await fetch(`${API_BASE_URL}/api/teacher/student-parent-details?student_id=${studentId}`);
        if (response.ok) {
            parentInfo = await response.json();
        }
    } catch (err) {
        parentInfo = null;
    }
    
    // Update modal content
    document.getElementById('modalStudentName').textContent = `${student.first_name} ${student.last_name}`;
    document.getElementById('modalStudentId').textContent = student.student_id;
    document.getElementById('modalStudentEmail').textContent = student.email;
    document.getElementById('modalStudentClass').textContent = document.getElementById('currentClassName').textContent;

    // Add parent info below student name
    let parentInfoHtml = '';
    if (parentInfo && parentInfo.parent_id) {
        parentInfoHtml = `
            <div class="info-item"><span class="info-label">Parent ID:</span> <span class="info-value">${parentInfo.parent_id}</span></div>
            <div class="info-item"><span class="info-label">Parent Email:</span> <span class="info-value">${parentInfo.parent_email || 'N/A'}</span></div>
            <div class="info-item"><span class="info-label">Parent Name:</span> <span class="info-value">${parentInfo.parent_username || 'N/A'}</span></div>
        `;
    } else {
        parentInfoHtml = `<div class="info-item"><span class="info-label">Parent:</span> <span class="info-value">Not available</span></div>`;
    }
    
    // Insert parent info just below student name
    const modalStudentNameElem = document.getElementById('modalStudentName');
    let parentInfoElem = document.getElementById('modalParentInfo');
    if (!parentInfoElem) {
        parentInfoElem = document.createElement('div');
        parentInfoElem.id = 'modalParentInfo';
        modalStudentNameElem.insertAdjacentElement('afterend', parentInfoElem);
    }
    parentInfoElem.innerHTML = parentInfoHtml;
    
    // Open modal
    openModal('studentModal');
}

// Load materials
async function loadMaterials() {
    const materialsGrid = document.getElementById('materials-grid');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/teacher/materials?teacher_id=${teacher.user_id}`);
        if (!response.ok) throw new Error('Failed to load materials');
        
        const materials = await response.json();
        
        if (materials.length === 0) {
            materialsGrid.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-book" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <p>No materials found</p>
                </div>
            `;
            return;
        }
        
        materialsGrid.innerHTML = materials.map(material => `
            <div class="material-card">
                <div class="card-header">
                    <i class="fas fa-book"></i>
                    <h3>${material.title}</h3>
                </div>
                <div class="card-content">
                    <p><strong>Class:</strong> ${material.class_name}</p>
                    <p><strong>Subject:</strong> ${material.subject_name}</p>
                    <p><strong>Uploaded:</strong> ${new Date(material.uploaded_at).toLocaleDateString()}</p>
                    <a href="https://www.inf.unibz.it/~calvanese/teaching/04-05-ip/lecture-notes/uni01.pdf" target="_blank" class="btn-primary">
                        <i class="fas fa-download"></i> Download
                    </a>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading materials:', error);
        materialsGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle" style="color: #e74c3c; font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Failed to load materials. Please try again.</p>
            </div>
        `;
    }
}

// Load assignments
async function loadAssignments() {
    const assignmentsGrid = document.getElementById('assignments-grid');
    
    try {
        // Use temporary data instead of API call
        const assignments = tempAssignmentsData;
        
        if (assignments.length === 0) {
            assignmentsGrid.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-tasks" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <p>No assignments found</p>
                </div>
            `;
            return;
        }
        
        assignmentsGrid.innerHTML = assignments.map(assignment => `
            <div class="assignment-card">
                <div class="card-header">
                    <i class="fas fa-tasks"></i>
                    <h3>${assignment.title}</h3>
                </div>
                <div class="card-content">
                    <p><strong>Class:</strong> ${assignment.class_name}</p>
                    <p><strong>Subject:</strong> ${assignment.subject_name}</p>
                    <p><strong>Due:</strong> ${new Date(assignment.due_date).toLocaleDateString()}</p>
                    <p><strong>Description:</strong> ${assignment.description}</p>
                    <div class="assignment-actions">
                        <button class="btn-primary" onclick="viewSubmissions(${assignment.assignment_id})">
                            <i class="fas fa-eye"></i> View Submissions
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading assignments:', error);
        assignmentsGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle" style="color: #e74c3c; font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Failed to load assignments. Please try again.</p>
            </div>
        `;
    }
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Form handlers
async function handleMaterialSubmit(e) {
    e.preventDefault();
    
    const formData = {
        teacher_id: teacher.user_id,
        title: document.getElementById('material-title').value,
        class_id: document.getElementById('material-class').value,
        subject_id: document.getElementById('material-subject').value,
        file_path: document.getElementById('material-file').value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/teacher/materials`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showToast('Material uploaded successfully!', false);
            closeModal('materialModal');
            loadMaterials();
            } else {
            throw new Error('Failed to upload material');
            }
        } catch (error) {
        console.error('Error uploading material:', error);
        showToast('Failed to upload material', true);
    }
}

async function handleAssignmentSubmit(e) {
    e.preventDefault();
    
    const formData = {
        teacher_id: teacher.user_id,
        title: document.getElementById('assignment-title').value,
        description: document.getElementById('assignment-description').value,
        class_id: document.getElementById('assignment-class').value,
        subject_id: document.getElementById('assignment-subject').value,
        due_date: document.getElementById('assignment-due-date').value,
        file_path: document.getElementById('assignment-file').value || null
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/teacher/assignments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showToast('Assignment created successfully!', false);
            closeModal('assignmentModal');
            loadAssignments();
        } else {
            throw new Error('Failed to create assignment');
        }
    } catch (error) {
        console.error('Error creating assignment:', error);
        showToast('Failed to create assignment', true);
    }
}

// Start attendance
function startAttendance() {
    if (currentClassId) {
        // Pass the current class ID to the classroom page
        window.location.href = `classroom.html?class_id=${currentClassId}`;
    } else {
        showToast('Please select a class first', true);
    }
}

// Show grade assignment modal
async function showGradeModal() {
    const currentStudent = getCurrentStudent();
    if (!currentStudent) return;
    
    // Set student ID
    document.getElementById('grade-student-id').value = currentStudent.student_id;
    
    // Load subjects and semesters
    await loadSubjectsForSelect('grade-subject');
    await loadSemestersForSelect('grade-semester');
    
    // Open modal
    openModal('gradeModal');
}

// Show material modal for specific student
async function showMaterialModal() {
    const currentStudent = getCurrentStudent();
    if (!currentStudent) return;
    
    // Set student ID
    document.getElementById('send-material-student-id').value = currentStudent.student_id;
    
    // Load classes and subjects
    await loadClassesForSelect('send-material-class');
    await loadSubjectsForSelect('send-material-subject');
    
    // Pre-select current class if available
    if (currentClassId) {
        const classSelect = document.getElementById('send-material-class');
        classSelect.value = currentClassId;
    }
    
    // Open modal
    openModal('sendMaterialModal');
}

// Show assignment modal for specific student
async function showAssignmentModal() {
    const currentStudent = getCurrentStudent();
    if (!currentStudent) return;
    
    // Set student ID
    document.getElementById('student-assignment-student-id').value = currentStudent.student_id;
    
    // Load classes and subjects
    await loadClassesForSelect('student-assignment-class');
    await loadSubjectsForSelect('student-assignment-subject');
    
    // Pre-select current class if available
    if (currentClassId) {
        const classSelect = document.getElementById('student-assignment-class');
        classSelect.value = currentClassId;
    }
    
    // Open modal
    openModal('studentAssignmentModal');
}

// Show submissions modal
async function showSubmissionsModal() {
    const currentStudent = getCurrentStudent();
    if (!currentStudent) return;
    
    // Load submissions for the current student
    await loadStudentSubmissions(currentStudent.student_id);
    
    // Open modal
    openModal('submissionsModal');
}

// Load submissions
async function loadSubmissions() {
    const submissionsGrid = document.getElementById('submissions-grid');
    
    try {
        // Use temporary data instead of API call
        const assignments = tempAssignmentsData;
        
        if (assignments.length === 0) {
            submissionsGrid.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-file-alt" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <p>No assignments found</p>
                </div>
            `;
            return;
        }
        
        submissionsGrid.innerHTML = assignments.map(assignment => {
            const submittedCount = assignment.submissions.filter(s => s.status === 'Submitted' || s.status === 'Late Submission').length;
            const totalSubmissions = assignment.submissions.length;
            const notSubmittedCount = assignment.submissions.filter(s => s.status === 'Not Submitted').length;
            
            return `
                <div class="submission-overview-card">
                    <div class="card-header">
                        <i class="fas fa-file-alt"></i>
                        <h3>${assignment.title}</h3>
                    </div>
                    <div class="card-content">
                        <div class="assignment-info">
                            <p><strong>Class:</strong> ${assignment.class_name}</p>
                            <p><strong>Subject:</strong> ${assignment.subject_name}</p>
                            <p><strong>Due Date:</strong> ${new Date(assignment.due_date).toLocaleDateString()}</p>
                        </div>
                        <div class="submission-stats">
                            <div class="stat-item">
                                <div class="stat-number" style="color: #27ae60;">${submittedCount}</div>
                                <div class="stat-label">Submitted</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number" style="color: #e74c3c;">${notSubmittedCount}</div>
                                <div class="stat-label">Not Submitted</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">${totalSubmissions}</div>
                                <div class="stat-label">Total Students</div>
                            </div>
                        </div>
                        <div class="submission-actions">
                            <button class="btn-primary" onclick="viewSubmissions(${assignment.assignment_id})">
                                <i class="fas fa-eye"></i> View Details
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading submissions:', error);
        submissionsGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle" style="color: #e74c3c; font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Failed to load submissions. Please try again.</p>
            </div>
        `;
    }
}

// View submissions
function viewSubmissions(assignmentId) {
    const assignment = tempAssignmentsData.find(a => a.assignment_id === assignmentId);
    if (!assignment) {
        showToast('Assignment not found', true);
        return;
    }
    
    // Create detailed submissions modal content
    const submissionsContent = document.getElementById('submissions-content');
    
    if (assignment.submissions.length === 0) {
        submissionsContent.innerHTML = `
            <div class="no-data">
                <i class="fas fa-file-alt" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                <p>No submissions found for this assignment</p>
            </div>
        `;
    } else {
        submissionsContent.innerHTML = `
            <div class="assignment-details">
                <h3>${assignment.title}</h3>
                <p><strong>Class:</strong> ${assignment.class_name} | <strong>Subject:</strong> ${assignment.subject_name}</p>
                <p><strong>Due Date:</strong> ${new Date(assignment.due_date).toLocaleDateString()}</p>
            </div>
            <div class="submissions-list">
                ${assignment.submissions.map(submission => `
                    <div class="submission-card ${submission.status === 'Not Submitted' ? 'not-submitted' : submission.status === 'Late Submission' ? 'late-submission' : 'submitted'}">
                        <div class="submission-header">
                            <div class="student-info">
                                <h4>${submission.student_name}</h4>
                                <span class="student-id">ID: ${submission.student_id}</span>
                            </div>
                            <div class="submission-status">
                                <span class="status-badge ${submission.status.toLowerCase().replace(' ', '-')}">${submission.status}</span>
                            </div>
                        </div>
                        <div class="submission-details">
                            ${submission.submitted_at ? `
                                <p><strong>Submitted:</strong> ${new Date(submission.submitted_at).toLocaleString()}</p>
                                ${submission.file_path ? `
                                    <p><strong>File:</strong> <a href="${submission.file_path}" target="_blank" class="file-link">
                                        <i class="fas fa-download"></i> Download Submission
                                    </a></p>
                                ` : ''}
                                ${submission.grade !== null ? `
                                    <p><strong>Grade:</strong> <span class="grade">${submission.grade}/100</span></p>
                                ` : '<p><strong>Grade:</strong> <span class="not-graded">Not graded yet</span></p>'}
                                ${submission.feedback ? `
                                    <p><strong>Feedback:</strong> ${submission.feedback}</p>
                                ` : ''}
                            ` : `
                                <p class="not-submitted-text">No submission received</p>
                            `}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Update modal title
    document.querySelector('#submissionsModal .modal-header h2').textContent = `Submissions: ${assignment.title}`;
    
    // Open modal
    openModal('submissionsModal');
}

// Utility functions
function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'error' : 'success'}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 3000;
        animation: slideIn 0.3s ease;
        ${isError ? 'background: #e74c3c;' : 'background: #27ae60;'}
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Get current student from modal
function getCurrentStudent() {
    const studentId = document.getElementById('modalStudentId')?.textContent;
    if (!studentId) return null;
    
    return studentsData.find(student => student.student_id == studentId);
}

// Load classes for select dropdown
async function loadClassesForSelect(selectId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/teacher/classes?teacher_id=${teacher.user_id}`);
        if (!response.ok) return;
        
        const classes = await response.json();
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Select Class</option>';
        
        classes.forEach(cls => {
            select.innerHTML += `<option value="${cls.class_id}">${cls.class_name}</option>`;
        });
    } catch (error) {
        console.error('Error loading classes:', error);
    }
}

// Load subjects for select dropdown
async function loadSubjectsForSelect(selectId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/teacher/schedule?teacher_id=${teacher.user_id}`);
        if (!response.ok) return;
        
        const schedule = await response.json();
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Select Subject</option>';
        
        const uniqueSubjects = new Set();
        schedule.forEach(item => {
            if (!uniqueSubjects.has(item.subject_id)) {
                select.innerHTML += `<option value="${item.subject_id}">${item.subject_name}</option>`;
                uniqueSubjects.add(item.subject_id);
            }
        });
    } catch (error) {
        console.error('Error loading subjects:', error);
    }
}

// Load semesters for select dropdown
async function loadSemestersForSelect(selectId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/semesters`);
        if (!response.ok) return;
        
        const semesters = await response.json();
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Select Semester</option>';
        
        semesters.forEach(semester => {
            select.innerHTML += `<option value="${semester.semester_id}">${semester.semester_name}</option>`;
        });
    } catch (error) {
        console.error('Error loading semesters:', error);
        // Fallback to basic semester options
        const select = document.getElementById(selectId);
        select.innerHTML = `
            <option value="">Select Semester</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
            <option value="3">Semester 3</option>
            <option value="4">Semester 4</option>
        `;
    }
}

// Load student submissions
async function loadStudentSubmissions(studentId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/teacher/student-submissions?student_id=${studentId}`);
        const submissions = await response.json();
        
        const submissionsContent = document.getElementById('submissions-content');
        
        if (!response.ok || submissions.length === 0) {
            submissionsContent.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-file-alt" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <p>No submissions found for this student</p>
                </div>
            `;
            return;
        }
        
        submissionsContent.innerHTML = submissions.map(submission => `
            <div class="submission-card">
                <div class="card-header">
                    <i class="fas fa-file-alt"></i>
                    <h3>${submission.assignment_title}</h3>
                </div>
                <div class="card-content">
                    <p><strong>Submitted:</strong> ${new Date(submission.submitted_at).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> ${submission.status || 'Submitted'}</p>
                    ${submission.file_path ? `<a href="${submission.file_path}" target="_blank" class="btn-primary">View Submission</a>` : ''}
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading submissions:', error);
        const submissionsContent = document.getElementById('submissions-content');
        submissionsContent.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle" style="color: #e74c3c; font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Failed to load submissions. Please try again.</p>
            </div>
        `;
    }
}

// Handle grade submission
async function handleGradeSubmit(e) {
    e.preventDefault();
    
    const formData = {
        student_id: document.getElementById('grade-student-id').value,
        subject_id: document.getElementById('grade-subject').value,
        semester_id: document.getElementById('grade-semester').value,
        grade_value: document.getElementById('grade-value').value,
        comments: document.getElementById('grade-comments').value,
        teacher_id: teacher.user_id
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/teacher/grades`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showToast('Grade assigned successfully!', false);
            closeModal('gradeModal');
        } else {
            throw new Error('Failed to assign grade');
        }
    } catch (error) {
        console.error('Error assigning grade:', error);
        showToast('Failed to assign grade', true);
    }
}

// Handle send material submission
async function handleSendMaterialSubmit(e) {
    e.preventDefault();
    
    const formData = {
        teacher_id: teacher.user_id,
        student_id: document.getElementById('send-material-student-id').value,
        title: document.getElementById('send-material-title').value,
        class_id: document.getElementById('send-material-class').value,
        subject_id: document.getElementById('send-material-subject').value,
        file_path: document.getElementById('send-material-file').value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/teacher/send-material`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showToast('Material sent successfully!', false);
            closeModal('sendMaterialModal');
        } else {
            throw new Error('Failed to send material');
        }
    } catch (error) {
        console.error('Error sending material:', error);
        showToast('Failed to send material', true);
    }
}

// Handle student assignment submission
async function handleStudentAssignmentSubmit(e) {
    e.preventDefault();
    
    const formData = {
        teacher_id: teacher.user_id,
        student_id: document.getElementById('student-assignment-student-id').value,
        title: document.getElementById('student-assignment-title').value,
        description: document.getElementById('student-assignment-description').value,
        class_id: document.getElementById('student-assignment-class').value,
        subject_id: document.getElementById('student-assignment-subject').value,
        due_date: document.getElementById('student-assignment-due-date').value,
        file_path: document.getElementById('student-assignment-file').value || null
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/teacher/individual-assignment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showToast('Individual assignment created successfully!', false);
            closeModal('studentAssignmentModal');
        } else {
            throw new Error('Failed to create individual assignment');
        }
    } catch (error) {
        console.error('Error creating individual assignment:', error);
        showToast('Failed to create individual assignment', true);
    }
}

// Chat with student
function chatWithStudent() {
    const currentStudent = getCurrentStudent();
    if (!currentStudent) {
        showToast('No student selected', true);
        return;
    }
    
    // Set user info for chat
    localStorage.setItem('user', JSON.stringify({
        userId: teacher.user_id,
        userType: 'teacher',
        userName: `${teacher.first_name} ${teacher.last_name}`
    }));
    
    // Set chat target
    localStorage.setItem('chatTarget', JSON.stringify({
        userId: currentStudent.student_id,
        userType: 'student',
        userName: `${currentStudent.first_name} ${currentStudent.last_name}`
    }));
    
    window.location.href = 'chat.html';
}

// Chat with parent
function chatWithParent() {
    const currentStudent = getCurrentStudent();
    if (!currentStudent) {
        showToast('No student selected', true);
        return;
    }
    
    // Get parent info from the modal
    const parentInfoElem = document.getElementById('modalParentInfo');
    if (!parentInfoElem || !parentInfoElem.textContent.includes('Parent ID:')) {
        showToast('Parent information not available', true);
        return;
    }
    
    // Extract parent ID from the modal content
    const parentIdMatch = parentInfoElem.textContent.match(/Parent ID:\s*(\d+)/);
    if (!parentIdMatch) {
        showToast('Parent ID not found', true);
        return;
    }
    
    const parentId = parentIdMatch[1];
    
    // Set user info for chat
    localStorage.setItem('user', JSON.stringify({
        userId: teacher.user_id,
        userType: 'teacher',
        userName: `${teacher.first_name} ${teacher.last_name}`
    }));
    
    // Set chat target
    localStorage.setItem('chatTarget', JSON.stringify({
        userId: parentId,
        userType: 'parent',
        userName: 'Parent'
    }));
    
    window.location.href = 'chat.html';
}

function logout() {
    localStorage.removeItem('teacher');
    window.location.href = 'landingpage.html';
}