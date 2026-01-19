
const JOBS = [
    {
        id: '1',
        title: 'Senior Frontend Developer (ReactJS/VueJS)',
        companyName: 'Tech Unicorn Javascript',
        salary: '2000 - 3000 USD',
        location: 'Hà Nội',
        updatedAt: '1 giờ trước',
        tags: ['ReactJS', 'TypeScript', 'Redux'],
        logoUrl: 'https://via.placeholder.com/64/00b14f/ffffff?text=Tech'
    },
    {
        id: '2',
        title: 'Java Backend Engineer (Spring Boot)',
        companyName: 'Global Banking Solutions',
        salary: 'Thỏa thuận',
        location: 'Hồ Chí Minh',
        updatedAt: 'Hôm qua',
        tags: ['Java', 'Spring', 'MySQL'],
        logoUrl: 'https://via.placeholder.com/64/212f3f/ffffff?text=Bank'
    },
    {
        id: '3',
        title: 'Fresher Tester / QC',
        companyName: 'Software Outsourcing Asia',
        salary: '10 - 15 Triệu',
        location: 'Đà Nẵng',
        updatedAt: '2 ngày trước',
        tags: ['Manual Test', 'Jira'],
        logoUrl: 'https://via.placeholder.com/64/eab308/ffffff?text=QC'
    },
    {
        id: '4',
        title: 'Product Owner (English Communication)',
        companyName: 'Fintech Startup',
        salary: 'Up to $2500',
        location: 'Hà Nội',
        updatedAt: 'Hôm nay',
        tags: ['Agile', 'Scrum', 'English'],
        logoUrl: 'https://via.placeholder.com/64/ef4444/ffffff?text=PO'
    },
    {
        id: '5',
        title: 'AI Engineer (Python, PyTorch)',
        companyName: 'AI Research Lab',
        salary: '3000 - 5000 USD',
        location: 'Hồ Chí Minh',
        updatedAt: '30 phút trước',
        tags: ['Python', 'NLP', 'LLM'],
        logoUrl: 'https://via.placeholder.com/64/6366f1/ffffff?text=AI'
    },
    {
        id: '6',
        title: 'Marketing Executive',
        companyName: 'E-commerce Group',
        salary: '12 - 18 Triệu',
        location: 'Hà Nội',
        updatedAt: 'Vừa xong',
        tags: ['Marketing', 'Content'],
        logoUrl: 'https://via.placeholder.com/64/ec4899/ffffff?text=MKT'
    }
];

export const getJobs = async () => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(JOBS), 800);
    });
};
