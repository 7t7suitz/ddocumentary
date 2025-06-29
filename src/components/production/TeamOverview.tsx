import React, { useState } from 'react';
import { 
  Users, Plus, Edit3, Trash2, Check, 
  X, Filter, Search, Download, Mail, 
  Phone, Clock, DollarSign, Calendar
} from 'lucide-react';
import { ProductionProject, TeamMember } from '../../types/production';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

interface TeamOverviewProps {
  project: ProductionProject;
  onProjectUpdate: (project: ProductionProject) => void;
}

export const TeamOverview: React.FC<TeamOverviewProps> = ({
  project,
  onProjectUpdate
}) => {
  const [activeTab, setActiveTab] = useState('team');
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [newMember, setNewMember] = useState<Partial<TeamMember>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');

  const updateTeam = (team: TeamMember[]) => {
    onProjectUpdate({
      ...project,
      team
    });
  };

  const addTeamMember = () => {
    if (!newMember.name || !newMember.role || !newMember.department) return;
    
    const member: TeamMember = {
      id: uuidv4(),
      name: newMember.name || '',
      role: newMember.role || '',
      department: newMember.department || '',
      email: newMember.email || '',
      phone: newMember.phone || '',
      rate: {
        amount: newMember.rate?.amount || 0,
        unit: newMember.rate?.unit || 'daily'
      },
      availability: {
        startDate: newMember.availability?.startDate || project.startDate,
        endDate: newMember.availability?.endDate || project.endDate,
        exceptions: []
      },
      skills: newMember.skills || [],
      notes: newMember.notes || '',
      documents: {}
    };
    
    updateTeam([...project.team, member]);
    setNewMember({});
  };

  const updateTeamMember = (id: string, updates: Partial<TeamMember>) => {
    const updatedTeam = project.team.map(member => 
      member.id === id ? { ...member, ...updates } : member
    );
    
    updateTeam(updatedTeam);
    setEditingMember(null);
  };

  const deleteTeamMember = (id: string) => {
    updateTeam(project.team.filter(member => member.id !== id));
  };

  const exportTeam = () => {
    const teamData = JSON.stringify(project.team, null, 2);
    const blob = new Blob([teamData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '-').toLowerCase()}-team.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const departments = Array.from(new Set(project.team.map(member => member.department)));

  const filteredTeam = project.team.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         member.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || member.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const renderTeamTab = () => (
    <div className="space-y-6">
      {/* Add Team Member Form */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Add Team Member
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Name*
            </label>
            <input
              type="text"
              value={newMember.name || ''}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., John Doe"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Role*
            </label>
            <input
              type="text"
              value={newMember.role || ''}
              onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., Director of Photography"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Department*
            </label>
            <input
              type="text"
              value={newMember.department || ''}
              onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., Camera"
              list="departments"
            />
            <datalist id="departments">
              {departments.map(dept => (
                <option key={dept} value={dept} />
              ))}
            </datalist>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={newMember.email || ''}
              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., john@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={newMember.phone || ''}
              onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., (123) 456-7890"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Rate
            </label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <input
                  type="number"
                  value={newMember.rate?.amount || ''}
                  onChange={(e) => setNewMember({ 
                    ...newMember, 
                    rate: { 
                      ...newMember.rate, 
                      amount: parseFloat(e.target.value) 
                    } 
                  })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  placeholder="Amount"
                  min="0"
                  step="0.01"
                />
              </div>
              <select
                value={newMember.rate?.unit || 'daily'}
                onChange={(e) => setNewMember({ 
                  ...newMember, 
                  rate: { 
                    ...newMember.rate, 
                    unit: e.target.value as any 
                  } 
                })}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="project">Project</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Skills (comma separated)
            </label>
            <input
              type="text"
              value={newMember.skills?.join(', ') || ''}
              onChange={(e) => setNewMember({ 
                ...newMember, 
                skills: e.target.value.split(',').map(skill => skill.trim()).filter(Boolean)
              })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., Lighting, Camera Operation, etc."
            />
          </div>
          
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              value={newMember.notes || ''}
              onChange={(e) => setNewMember({ ...newMember, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="Additional notes about this team member"
              rows={2}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={addTeamMember}
            disabled={!newMember.name || !newMember.role || !newMember.department}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add Team Member</span>
          </button>
        </div>
      </div>

      {/* Team Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search team..."
                className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-48"
              />
            </div>
            
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={exportTeam}
              className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Team List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Team Members ({filteredTeam.length})
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeam.map(member => (
            <div key={member.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              {editingMember === member.id ? (
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Name</label>
                      <input
                        type="text"
                        value={newMember.name !== undefined ? newMember.name : member.name}
                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Role</label>
                      <input
                        type="text"
                        value={newMember.role !== undefined ? newMember.role : member.role}
                        onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Department</label>
                      <input
                        type="text"
                        value={newMember.department !== undefined ? newMember.department : member.department}
                        onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                        list="departments"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setEditingMember(null);
                        setNewMember({});
                      }}
                      className="px-3 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                    >
                      Cancel
                    </button>
                    
                    <button
                      onClick={() => {
                        updateTeamMember(member.id, newMember);
                        setNewMember({});
                      }}
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-slate-50 dark:bg-slate-700 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-slate-100">
                          {member.name}
                        </h4>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {member.role}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingMember(member.id);
                            setNewMember({});
                          }}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                        >
                          <Edit3 className="w-4 h-4 text-slate-500" />
                        </button>
                        
                        <button
                          onClick={() => deleteTeamMember(member.id)}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full">
                          {member.department}
                        </span>
                        
                        {member.rate.amount > 0 && (
                          <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                            ${member.rate.amount}/{member.rate.unit}
                          </span>
                        )}
                      </div>
                      
                      {member.email && (
                        <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <a href={`mailto:${member.email}`} className="hover:underline">
                            {member.email}
                          </a>
                        </div>
                      )}
                      
                      {member.phone && (
                        <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <a href={`tel:${member.phone}`} className="hover:underline">
                            {member.phone}
                          </a>
                        </div>
                      )}
                      
                      {member.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {member.skills.map((skill, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {member.notes && (
                        <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                          {member.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        
        {filteredTeam.length === 0 && (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            No team members found matching your criteria
          </div>
        )}
      </div>
    </div>
  );

  const renderDepartmentsTab = () => (
    <div className="space-y-6">
      {/* Department Summary */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Department Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map(department => {
            const departmentMembers = project.team.filter(member => member.department === department);
            const totalCost = departmentMembers.reduce((sum, member) => {
              let rate = member.rate.amount;
              if (member.rate.unit === 'hourly') {
                rate *= 8; // Assuming 8 hours per day
              } else if (member.rate.unit === 'weekly') {
                rate /= 5; // Assuming 5 days per week
              }
              return sum + rate;
            }, 0);
            
            return (
              <div key={department} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                  {department}
                </h4>
                
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {departmentMembers.length} team member{departmentMembers.length !== 1 ? 's' : ''}
                  </div>
                  
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    ${totalCost.toLocaleString()}/day
                  </div>
                </div>
                
                <div className="space-y-1">
                  {departmentMembers.slice(0, 3).map(member => (
                    <div key={member.id} className="text-sm text-slate-700 dark:text-slate-300">
                      {member.name} - {member.role}
                    </div>
                  ))}
                  
                  {departmentMembers.length > 3 && (
                    <div className="text-sm text-blue-600 dark:text-blue-400">
                      +{departmentMembers.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Department Schedule */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Department Schedule
        </h3>
        
        <div className="space-y-6">
          {departments.map(department => {
            const departmentMembers = project.team.filter(member => member.department === department);
            
            // Get all shooting days where any department member is scheduled
            const relevantShootingDays = project.schedule.shootingDays.filter(day => 
              day.crew.some(crewId => departmentMembers.some(member => member.id === crewId))
            );
            
            return (
              <div key={department} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-700 p-4">
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">
                    {department} Schedule
                  </h4>
                </div>
                
                <div className="p-4">
                  {relevantShootingDays.length > 0 ? (
                    <div className="space-y-2">
                      {relevantShootingDays
                        .sort((a, b) => a.date.getTime() - b.date.getTime())
                        .map(day => {
                          const location = project.locations.find(l => l.id === day.locationId);
                          const departmentCrew = day.crew.filter(crewId => 
                            departmentMembers.some(member => member.id === crewId)
                          ).map(crewId => 
                            project.team.find(member => member.id === crewId)?.name || 'Unknown'
                          );
                          
                          return (
                            <div key={day.id} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <div className="font-medium text-slate-900 dark:text-slate-100">
                                  {format(day.date, 'EEEE, MMMM d, yyyy')}
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  day.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                  day.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                  day.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                  'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                                }`}>
                                  {day.status}
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                                <div>{location?.name || 'Unknown location'}</div>
                                <div>{format(day.callTime, 'h:mm a')} call time</div>
                              </div>
                              
                              <div className="mt-2">
                                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                  Department Crew:
                                </div>
                                <div className="text-sm text-slate-700 dark:text-slate-300">
                                  {departmentCrew.join(', ')}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                      No scheduled shooting days for this department
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Team Management
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Manage team members, departments, and schedules
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={exportTeam}
            className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('team')}
            className={`
              flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg
              ${activeTab === 'team'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
              }
            `}
          >
            <Users className="w-4 h-4" />
            <span>Team Members</span>
          </button>
          
          <button
            onClick={() => setActiveTab('departments')}
            className={`
              flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg
              ${activeTab === 'departments'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
              }
            `}
          >
            <Users className="w-4 h-4" />
            <span>Departments</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'team' && renderTeamTab()}
        {activeTab === 'departments' && renderDepartmentsTab()}
      </div>
    </div>
  );
};