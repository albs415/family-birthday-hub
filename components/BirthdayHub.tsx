import { useState, useEffect } from 'react';

interface Person {
  id: number;
  name: string;
  dob: string;
}

// Helper: calculate age based on date of birth
function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Helper: find next birthday after today
function nextBirthday(dob: string, now: Date): Date {
  const birth = new Date(dob);
  const year = now.getFullYear();
  let next = new Date(year, birth.getMonth(), birth.getDate());
  if (next < now) next = new Date(year + 1, birth.getMonth(), birth.getDate());
  return next;
}

// Helper: calculate days between two dates
function daysUntil(date: Date, now: Date): number {
  const diff = date.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * BirthdayHub component
 *
 * This component fetches birthdays from the API route `/api/birthdays` and allows
 * users to add new birthdays. It calculates age, next birthday, and days until
 * the next birthday for each entry and displays them in a modern, responsive list.
 */
export default function BirthdayHub() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newDob, setNewDob] = useState('');

  // Fetch existing birthdays on mount
  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        const res = await fetch('/api/birthdays');
        const data = await res.json();
        setPeople(data || []);
      } catch (error) {
        console.error('Failed to load birthdays', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBirthdays();
  }, []);

  // Handle adding a new birthday
  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
    if (!newName.trim() || !newDob) return;
    try {
      const res = await fetch('/api/birthdays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), dob: newDob }),
      });
      const data = await res.json();
      // Append the new person returned from the API
      setPeople((prev) => [...prev, data]);
      setNewName('');
      setNewDob('');
    } catch (error) {
      console.error('Error adding birthday', error);
    }
  };

  // Enhance people with calculated fields and sort by days left until next birthday
  const now = new Date();
  const enhanced = people
    .map((p) => {
      const next = nextBirthday(p.dob, now);
      return {
        ...p,
        age: calculateAge(p.dob),
        next,
        daysLeft: daysUntil(next, now),
      };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading birthdays...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
          Family Birthday Hub
        </h1>
        {/* Form to add new birthdays */}
        <form
          onSubmit={handleAdd}
          className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end justify-center mb-10"
        >
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              placeholder="Enter name"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Date of Birth
            </label>
            <input
              type="date"
              value={newDob}
              onChange={(e) => setNewDob(e.target.value)}
              className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 focus:outline-none transition-colors"
          >
            Add
          </button>
        </form>
        {/* List of birthdays */}
        <div className="space-y-4">
          {enhanced.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No birthdays yet. Start by adding a family member above!
            </p>
          ) : (
            enhanced.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {p.name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Next birthday: {p.next.toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {p.age}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {p.daysLeft} days
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
