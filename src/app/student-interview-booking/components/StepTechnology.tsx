'use client';

import React, { useState } from 'react';
import { BookingState } from './BookingWizard';
import { Search, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';

interface StepTechnologyProps {
  booking: BookingState;
  updateBooking: (u: Partial<BookingState>) => void;
  onNext: () => void;
}

const TECH_CATEGORIES = [
  {
    id: 'fullstack',
    label: 'Full Stack',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    selectedColor: 'bg-blue-600 text-white border-blue-600',
    items: ['Java Full Stack', 'Python Full Stack', 'MERN Stack', 'MEAN Stack'],
  },
  {
    id: 'backend',
    label: 'Backend',
    color: 'bg-purple-50 border-purple-200 text-purple-700',
    selectedColor: 'bg-purple-600 text-white border-purple-600',
    items: ['Spring Boot', 'Node.js', 'Django', 'FastAPI', 'Python'],
  },
  {
    id: 'frontend',
    label: 'Frontend',
    color: 'bg-pink-50 border-pink-200 text-pink-700',
    selectedColor: 'bg-pink-600 text-white border-pink-600',
    items: ['React', 'Angular'],
  },
  {
    id: 'devops',
    label: 'DevOps & Cloud',
    color: 'bg-orange-50 border-orange-200 text-orange-700',
    selectedColor: 'bg-orange-600 text-white border-orange-600',
    items: ['DevOps', 'AWS', 'Azure', 'Docker', 'Kubernetes'],
  },
  {
    id: 'security',
    label: 'Security',
    color: 'bg-red-50 border-red-200 text-red-700',
    selectedColor: 'bg-red-600 text-white border-red-600',
    items: ['Cyber Security', 'Ethical Hacking', 'Networking'],
  },
  {
    id: 'database',
    label: 'Database',
    color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    selectedColor: 'bg-yellow-600 text-white border-yellow-600',
    items: ['SQL', 'Oracle', 'MongoDB'],
  },
  {
    id: 'data',
    label: 'Data & AI',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    selectedColor: 'bg-emerald-600 text-white border-emerald-600',
    items: ['Data Science', 'Machine Learning', 'AI'],
  },
  {
    id: 'testing',
    label: 'Testing',
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    selectedColor: 'bg-indigo-600 text-white border-indigo-600',
    items: ['Testing', 'Automation Testing'],
  },
  {
    id: 'soft',
    label: 'Soft Skills',
    color: 'bg-teal-50 border-teal-200 text-teal-700',
    selectedColor: 'bg-teal-600 text-white border-teal-600',
    items: ['HR Interview', 'Behavioral Interview', 'Communication Skills'],
  },
  {
    id: 'cs',
    label: 'CS Fundamentals',
    color: 'bg-slate-50 border-slate-200 text-slate-700',
    selectedColor: 'bg-slate-600 text-white border-slate-600',
    items: ['System Design', 'DSA'],
  },
];

// Interviewer counts per technology (mock)
const INTERVIEWER_COUNT: Record<string, number> = {
  'MERN Stack': 48, 'Java Full Stack': 52, 'React': 61, 'Spring Boot': 44,
  'Python Full Stack': 38, 'MEAN Stack': 29, 'Node.js': 55, 'Django': 31,
  'FastAPI': 18, 'Python': 42, 'Angular': 35, 'DevOps': 27, 'AWS': 39,
  'Azure': 22, 'Docker': 31, 'Kubernetes': 19, 'Cyber Security': 14,
  'Ethical Hacking': 11, 'Networking': 16, 'SQL': 47, 'Oracle': 23,
  'MongoDB': 33, 'Data Science': 28, 'Machine Learning': 24, 'AI': 19,
  'Testing': 21, 'Automation Testing': 26, 'HR Interview': 34, 'Behavioral Interview': 29,
  'Communication Skills': 18, 'System Design': 37, 'DSA': 43,
};

const INTERVIEW_TYPES = [
  { id: 'technical', label: 'Technical Interview', desc: 'Coding, system design, domain knowledge' },
  { id: 'hr', label: 'HR Interview', desc: 'Behavioral, culture fit, compensation discussion' },
  { id: 'behavioral', label: 'Behavioral Interview', desc: 'STAR-based situational questions' },
];

export default function StepTechnology({ booking, updateBooking, onNext }: StepTechnologyProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [error, setError] = useState('');

  const resumeUploaded = true; // BACKEND: check if student has uploaded resume

  const allTechs = TECH_CATEGORIES.flatMap((cat) =>
    cat.items.map((item) => ({ item, cat }))
  );

  const filteredTechs = search
    ? allTechs.filter(({ item }) => item.toLowerCase().includes(search.toLowerCase()))
    : null;

  const displayCategories = activeCategory
    ? TECH_CATEGORIES.filter((c) => c.id === activeCategory)
    : TECH_CATEGORIES;

  const handleSelect = (tech: string, catId: string) => {
    updateBooking({ technology: tech, technologyCategory: catId });
    setError('');
  };

  const handleNext = () => {
    if (!booking.technology) {
      setError('Please select a technology to continue');
      return;
    }
    onNext();
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Choose your interview technology</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Select the technology domain you want to be interviewed in. We&apos;ll match you with a verified professional.
        </p>
      </div>

      {/* Resume check gate */}
      {!resumeUploaded && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-danger-bg border border-red-200 mb-5">
          <AlertTriangle size={18} className="text-danger flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-600 text-danger">Resume required before booking</p>
            <p className="text-xs text-danger mt-0.5">
              Upload your resume in your profile to book an interview. Interviewers review your resume before the session.
            </p>
            <button className="mt-2 text-xs btn-danger py-1.5 px-3">Upload Resume Now</button>
          </div>
        </div>
      )}

      {/* Interview type selector */}
      <div className="mb-6">
        <p className="text-sm font-600 text-foreground mb-2">Interview type</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {INTERVIEW_TYPES.map((type) => (
            <button
              key={`itype-${type.id}`}
              onClick={() => updateBooking({ interviewType: type.id as BookingState['interviewType'] })}
              className={`text-left p-3.5 rounded-xl border-2 transition-all duration-150 ${
                booking.interviewType === type.id
                  ? 'border-primary bg-blue-50' :'border-border bg-card hover:border-primary/40'
              }`}
            >
              <p className={`text-sm font-600 ${booking.interviewType === type.id ? 'text-primary' : 'text-foreground'}`}>
                {type.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{type.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search technology (e.g. React, Java, AWS...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-9 w-full"
        />
      </div>

      {/* Category filters */}
      {!search && (
        <div className="flex flex-wrap gap-2 mb-5">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1 rounded-full text-xs font-600 border transition-all ${
              !activeCategory ? 'bg-primary text-white border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary'
            }`}
          >
            All
          </button>
          {TECH_CATEGORIES.map((cat) => (
            <button
              key={`cat-filter-${cat.id}`}
              onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-600 border transition-all ${
                activeCategory === cat.id ? 'bg-primary text-white border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Search results */}
      {search && filteredTechs && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
          {filteredTechs.length === 0 ? (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              <p className="font-500">No technology found for &ldquo;{search}&rdquo;</p>
              <p className="text-xs mt-1">Try a different search term or browse categories below</p>
            </div>
          ) : (
            filteredTechs.map(({ item, cat }) => (
              <TechCard
                key={`search-${item}`}
                tech={item}
                category={cat}
                selected={booking.technology === item}
                count={INTERVIEWER_COUNT[item] || 0}
                onSelect={() => handleSelect(item, cat.id)}
              />
            ))
          )}
        </div>
      )}

      {/* Category grid */}
      {!search && (
        <div className="space-y-6 mb-6">
          {displayCategories.map((cat) => (
            <div key={`cat-section-${cat.id}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-600 border ${cat.color}`}>
                  {cat.label}
                </span>
                <span className="text-xs text-muted-foreground">{cat.items.length} technologies</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {cat.items.map((tech) => (
                  <TechCard
                    key={`tech-${tech}`}
                    tech={tech}
                    category={cat}
                    selected={booking.technology === tech}
                    count={INTERVIEWER_COUNT[tech] || 0}
                    onSelect={() => handleSelect(tech, cat.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-danger text-sm mb-4 flex items-center gap-1.5">
          <AlertTriangle size={14} />
          {error}
        </p>
      )}

      {/* Bottom bar */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div>
          {booking.technology && (
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-success" />
              <span className="text-sm font-600 text-foreground">{booking.technology}</span>
              <span className="text-xs text-muted-foreground">
                — {INTERVIEWER_COUNT[booking.technology] || 0} interviewers available
              </span>
            </div>
          )}
        </div>
        <button
          onClick={handleNext}
          disabled={!booking.technology}
          className="btn-primary px-6 py-2.5"
        >
          Continue to Duration
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

function TechCard({
  tech,
  category,
  selected,
  count,
  onSelect,
}: {
  tech: string;
  category: (typeof TECH_CATEGORIES)[0];
  selected: boolean;
  count: number;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`relative text-left p-3.5 rounded-xl border-2 transition-all duration-150 card-hover w-full ${
        selected ? 'tech-card-selected' : 'border-border bg-card hover:border-primary/40'
      }`}
    >
      {selected && (
        <div className="absolute top-2 right-2">
          <CheckCircle2 size={14} className="text-primary" />
        </div>
      )}
      <p className={`text-sm font-600 leading-tight ${selected ? 'text-primary' : 'text-foreground'}`}>
        {tech}
      </p>
      <p className="text-xs text-muted-foreground mt-1 tabular-nums">{count} interviewers</p>
    </button>
  );
}