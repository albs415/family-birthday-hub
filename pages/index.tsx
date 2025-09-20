import { useState } from 'react';

interface Person {
  name: string;
  dob: string;
}

const initialPeople: Person[] = [
  { name: 'Mom', dob: '1956-01-06' },
  { name: 'Jasper', dob: '2014-01-22' },
  { name: 'Tanishia', dob: '1985-01-28' },
  { name: 'John', dob: '1988-02-05' },
  { name: 'Riannon', dob: '2014-03-22' },
  { name: 'Charles Jr', dob: '2008-05-31' },
  { name: 'Orion', dob: '2016-06-21' },
  { name: 'Summer', dob: '1988-08-01' },
  { name: 'Landon', dob: '2013-09-10' },
  { name: 'Connor', dob: '2017-09-17' },
  { name: 'Tanner', dob: '2007-10-09' },
  { name: 'Bradley', dob: '2000-11-15' },
  { name: 'Brian', dob: '2004-12-04' },
  { name: 'Briana', dob: '1977-12-16' },
  { name: 'Benji', dob: '2011-12-22' },
  { name: 'Selia', dob: '1986-12-24' },
];

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function nextBirthday(dob: string, now: Date): Date {
  const birth = new Date(dob);
  const year = now.getFullYear();
  let next = new Date(year, birth.getMonth(), birth.getDate());
  if (next < now) {
    next = new Date(year + 1, birth.getMonth(), birth.getDate());
  }
  return next;
}

function daysUntil(date: Date, now: Date): number {
  const diff = date.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function Home() {
  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [newName, setNewName] = useState('');
  const [newDob, setNewDob] = useState('');

  const now = new Date();

  const peopleWithData = people
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

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newName || !newDob) return;
    setPeople([...people, { name: newName, dob: newDob }]);
    setNewName('');
    setNewDob('');
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Family Birthday Hub</h1>

      <form onSubmit={handleAdd} className="flex flex-wrap gap-2 mb-6">
        <input
          className="border rounded px-3 py-1 flex-1 min-w-[140px]"
          placeholder="Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <input
          className="border rounded px-3 py-1"
          type="date"
          value={newDob}
          onChange={(e) => setNewDob(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-1 rounded"
        >
          Add
        </button>
      </form>

      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="border-b p-2 text-left">Name</th>
            <th className="border-b p-2 text-left">Age</th>
            <th className="border-b p-2 text-left">Next Birthday</th>
            <th className="border-b p-2 text-left">Days Until</th>
          </tr>
        </thead>
        <tbody>
          {peopleWithData.map((person) => (
            <tr key={person.name + person.dob}>
              <td className="border-b p-2">{person.name}</td>
              <td className="border-b p-2">{person.age}</td>
              <td className="border-b p-2">
                {person.next.toLocaleDateString()}
              </td>
              <td className="border-b p-2">{person.daysLeft}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
