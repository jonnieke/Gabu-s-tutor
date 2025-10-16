import React from 'react';

interface RoleSelectionProps {
  onRoleSelect: (role: 'student' | 'parent' | 'teacher') => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onRoleSelect }) => {
  const roles = [
    {
      id: 'student' as const,
      title: "I'm a Student",
      emoji: "👩‍🎓",
      description: "I want Gabu to help with homework.",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      id: 'parent' as const,
      title: "I'm a Parent",
      emoji: "👨‍👩‍👧",
      description: "I want to track learning progress.",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      id: 'teacher' as const,
      title: "I'm a Teacher",
      emoji: "👨‍🏫",
      description: "I want lesson support.",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-blue-50 to-purple-50 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Who are you?
          </h1>
          <p className="text-xl text-gray-600">
            Choose your role to get personalized help from Gabu
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role, index) => (
            <button
              key={role.id}
              onClick={() => onRoleSelect(role.id)}
              className={`${role.bgColor} ${role.borderColor} border-2 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-left group`}
            >
              <div className="flex flex-col items-center text-center">
                <div className="text-4xl mb-4">{role.emoji}</div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  {role.title}
                </h3>
                
                <p className="text-gray-600 text-lg mb-4">
                  {role.description}
                </p>
                
                <div className="flex items-center gap-2 text-gray-500 group-hover:text-gray-700 transition-colors">
                  <span className="font-medium">Start with Gabu</span>
                  <span>→</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;