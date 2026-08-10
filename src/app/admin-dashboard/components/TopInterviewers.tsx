import React from 'react';
import { Star, TrendingUp, Award } from 'lucide-react';

const TOP_INTERVIEWERS = [
    { id: 'iv-top-001', name: 'Ananya Krishnamurthy', company: 'Amazon India', designation: 'SDE II', technologies: ['DSA', 'System Design'], rating: 4.97, sessions: 284, earnings: 68400, badge: 'Top Rated' },
    { id: 'iv-top-002', name: 'Pradeep Sharma', company: 'Google India', designation: 'Staff Engineer', technologies: ['Java Full Stack', 'Spring Boot'], rating: 4.94, sessions: 247, earnings: 59280, badge: 'Most Sessions' },
    { id: 'iv-top-003', name: 'Meena Iyer', company: 'Flipkart', designation: 'Senior SDE', technologies: ['MERN Stack', 'React'], rating: 4.92, sessions: 219, earnings: 52560, badge: null },
    { id: 'iv-top-004', name: 'Vijay Raghunathan', company: 'Swiggy', designation: 'Principal Engineer', technologies: ['Python Full Stack', 'DevOps'], rating: 4.91, sessions: 198, earnings: 47520, badge: null },
    { id: 'iv-top-005', name: 'Sneha Kulkarni', company: 'Infosys', designation: 'Technology Analyst', technologies: ['MEAN Stack', 'Angular'], rating: 4.89, sessions: 176, earnings: 42240, badge: null },
    { id: 'iv-top-006', name: 'Karthik Subramaniam', company: 'Wipro', designation: 'Senior Engineer', technologies: ['AWS', 'Docker'], rating: 4.87, sessions: 163, earnings: 39120, badge: null },
    { id: 'iv-top-007', name: 'Rahul Bhatia', company: 'HCL', designation: 'Data Scientist', technologies: ['ML/AI', 'Python'], rating: 4.85, sessions: 148, earnings: 35520, badge: 'Rising Star' },
    { id: 'iv-top-008', name: 'Deepika Nair', company: 'Accenture', designation: 'DevOps Engineer', technologies: ['Kubernetes', 'CI/CD'], rating: 4.83, sessions: 134, earnings: 32160, badge: null },
];

export default function TopInterviewers() {
    return (
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div>
                    <h3 className="text-base font-700 text-foreground">Top Rated Interviewers</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">By rating - July 2026</p>
                </div>
                <Award size={20} className="text-amber-500" />
            </div>
            <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border">
                            {['#', 'Interviewer', 'Technologies', 'Rating', 'Sessions', 'Earnings (July)']?.map((col) => (
                                <th key={`th-top-${col}`} className="text-left px-5 py-3">
                                    <span className="section-label">{col}</span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {TOP_INTERVIEWERS?.map((iv, idx) => (
                            <tr key={iv?.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                                <td className="px-5 py-3.5">
                                    <span className={`text-sm font-700 tabular-nums ${idx < 3 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                                        {idx + 1}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-700 flex-shrink-0">
                                            {iv?.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-600 text-foreground">{iv?.name}</p>
                                                {iv?.badge && (
                                                    <span className={`px-1.5 py-0.5 rounded text-xs font-600 ${iv?.badge === 'Top Rated' ? 'badge-warning' :
                                                            iv?.badge === 'Most Sessions' ? 'badge-info' : 'badge-success'
                                                        }`}>
                                                        {iv?.badge}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">{iv?.company} - {iv?.designation}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-3.5">
                                    <div className="flex flex-wrap gap-1">
                                        {iv?.technologies?.map((t) => (
                                            <span key={`top-tech-${iv?.id}-${t}`} className="px-1.5 py-0.5 rounded text-xs font-500 badge-neutral">{t}</span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-1">
                                        <Star size={13} className="text-amber-400 fill-amber-400" />
                                        <span className="text-sm font-700 tabular-nums text-foreground">{iv?.rating}</span>
                                    </div>
                                </td>
                                <td className="px-5 py-3.5">
                                    <span className="text-sm font-600 tabular-nums text-foreground">{iv?.sessions}</span>
                                </td>
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-1.5">
                                        <TrendingUp size={13} className="text-success" />
                                        <span className="text-sm font-700 tabular-nums text-success">Rs. {iv?.earnings?.toLocaleString('en-IN')}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}