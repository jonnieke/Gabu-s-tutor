import React from 'react';

const RoleCardsSection: React.FC = () => {
  const roles = [
    {
      title: "Students",
      icon: (
        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <div className="w-12 h-12 bg-[#f6e05e] rounded-full flex items-center justify-center relative">
            <div className="w-8 h-8 bg-[#2d3748] rounded-full"></div>
            <div className="absolute -bottom-2 w-12 h-8 bg-[#2d3748] rounded-t-full"></div>
          </div>
        </div>
      ),
      description: "Understand any topic"
    },
    {
      title: "Parents",
      icon: (
        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <div className="flex items-end gap-1">
            <div className="w-6 h-8 bg-[#63b3ed] rounded-t-full"></div>
            <div className="w-6 h-8 bg-[#f6ad55] rounded-t-full"></div>
          </div>
        </div>
      ),
      description: "Support learning at home"
    },
    {
      title: "Teachers",
      icon: (
        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <div className="w-12 h-12 bg-[#63b3ed] rounded-full flex items-center justify-center relative">
            <div className="w-8 h-8 bg-[#2d3748] rounded-full"></div>
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-3 bg-[#2d3748] rounded-full"></div>
          </div>
        </div>
      ),
      description: "Simplify lesson prep"
    }
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role, index) => (
            <div
              key={role.title}
              className="text-center"
            >
              {role.icon}
              
              <h3 className="text-xl font-bold text-[#2d3748] mb-2">
                {role.title}
              </h3>
              
              <p className="text-[#4a5568] text-lg">
                {role.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoleCardsSection;