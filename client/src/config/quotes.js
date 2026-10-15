/**
 * Curated list of strong, inspiring motivational quotes for PIET students
 * Randomly chosen on each successful certificate submission.
 */

export const MOTIVATIONAL_QUOTES = [
  {
    quote: "Success is the sum of small efforts repeated day in and day out.",
    author: "Robert Collier"
  },
  {
    quote: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson"
  },
  {
    quote: "The future belongs to those who prepare for it today.",
    author: "Malcolm X"
  },
  {
    quote: "It always seems impossible until it's done.",
    author: "Nelson Mandela"
  },
  {
    quote: "Excellence is not an act, but a habit. What you achieve today builds your tomorrow.",
    author: "Aristotle"
  },
  {
    quote: "The expert in anything was once a beginner.",
    author: "Helen Hayes"
  },
  {
    quote: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar"
  },
  {
    quote: "Your time is limited, don't waste it living someone else's life.",
    author: "Steve Jobs"
  },
  {
    quote: "Success isn't just about what you accomplish in your life, it's about what you inspire others to do.",
    author: "Unknown"
  },
  {
    quote: "Hard work beats talent when talent fails to work hard.",
    author: "Tim Notke"
  },
  {
    quote: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt"
  },
  {
    quote: "Continuous learning is the minimum requirement for success in any field.",
    author: "Brian Tracy"
  },
  {
    quote: "The only limit to our realization of tomorrow will be our doubts of today.",
    author: "Franklin D. Roosevelt"
  },
  {
    quote: "Opportunities don't happen. You create them through persistence and dedication.",
    author: "Chris Grosser"
  },
  {
    quote: "Every accomplishment starts with the decision to try.",
    author: "Gail Devers"
  },
  {
    quote: "Action is the foundational key to all success.",
    author: "Pablo Picasso"
  },
  {
    quote: "The secret of getting ahead is getting started.",
    author: "Mark Twain"
  },
  {
    quote: "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
    author: "Ralph Waldo Emerson"
  },
  {
    quote: "Strive not to be a success, but rather to be of value.",
    author: "Albert Einstein"
  },
  {
    quote: "Certificates mark your milestones; your curiosity drives your journey.",
    author: "PIET Academic Mentors"
  },
  {
    quote: "Dream big, work hard, stay focused, and surround yourself with good people.",
    author: "Anonymous"
  },
  {
    quote: "The difference between ordinary and extraordinary is that little extra.",
    author: "Jimmy Johnson"
  },
  {
    quote: "Small daily improvements over time lead to stunning results.",
    author: "Robin Sharma"
  },
  {
    quote: "Knowledge is power, but applying that knowledge creates true transformation.",
    author: "Dale Carnegie"
  },
  {
    quote: "Push yourself, because no one else is going to do it for you.",
    author: "Unknown"
  }
];

export function getRandomQuote() {
  const index = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
  return MOTIVATIONAL_QUOTES[index];
}
