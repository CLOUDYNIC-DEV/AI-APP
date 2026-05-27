// CONFIGURATION VARIABLES (Change these)
const API_KEY = "YOUR_API_KEY_HERE"; 
const TRAIN_TEXT = "Your Training Text";
const APP_NAME = "Your App Name";

export default async function handler(request: Request) {
  const url = new URL(request.url);

  if (request.method === "POST" && url.pathname === "/api/message") {
    try {
      const { prompt } = await request.json();
      if (!prompt) {
        return new Response("Missing prompt", { status: 400 });
      }

      const cloudynicUrl = new URL("https://cloudynic.com/api/v1/prompt");
      cloudynicUrl.searchParams.append("prompt", prompt);
      cloudynicUrl.searchParams.append("key", API_KEY);
      if (TRAIN_TEXT) {
        cloudynicUrl.searchParams.append("train", TRAIN_TEXT);
      }

      const response = await fetch(cloudynicUrl.toString(), { method: "GET" });
      const data = await response.text();

      return new Response(data, {
        status: response.status,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    } catch (err: any) {
      return new Response(`Error: ${err.message}`, { status: 500 });
    }
  }

  // ROUTE 2: Serve the Frontend HTML Interface on standard page load (GET /)
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${APP_NAME}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>tailwind.config = { darkMode: 'class' }</script>
    <style>
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: #888; border-radius: 2px; }
    </style>
  </head>
  <body class="bg-gray-50 text-gray-900 dark:bg-zinc-950 dark:text-zinc-100 min-h-screen transition-colors duration-200 flex flex-col font-sans">
  
    <header class="border-b border-gray-200 dark:border-zinc-800 p-4 flex justify-between items-center max-w-4xl w-full mx-auto">
      <h1 class="text-xl font-semibold tracking-tight text-gray-800 dark:text-zinc-200">${APP_NAME}</h1>
      <button id="theme-toggle" class="p-2 text-lg">Toggle Theme</button>
    </header>
  
    <main id="chat-box" class="flex-1 max-w-4xl w-full mx-auto p-4 overflow-y-auto space-y-4 flex flex-col justify-start">
      <div class="text-center text-sm opacity-40 my-auto raw-welcome">
        Connected securely. System Prompt: "${TRAIN_TEXT}"
      </div>
    </main>
  
    <footer class="border-t border-gray-200 dark:border-zinc-800 p-4 max-w-4xl w-full mx-auto">
      <form id="chat-form" class="flex gap-2">
        <input id="user-input" type="text" placeholder="Type a message..." autocomplete="off" class="flex-1 p-3 border dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600">
        <button type="submit" class="px-5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-lg text-sm font-medium hover:opacity-90">Send</button>
      </form>
    </footer>
  
    <script>
      const body = document.body;
      const themeToggleBtn = document.getElementById('theme-toggle');
      const chatBox = document.getElementById('chat-box');
      const chatForm = document.getElementById('chat-form');
      const userInput = document.getElementById('user-input');
  
      if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        body.classList.add('dark');
      }
  
      themeToggleBtn.addEventListener('click', () => {
        body.classList.toggle('dark');
        localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
      });
  
      function appendMessage(sender, text, isError = false) {
        const welcome = document.querySelector('.raw-welcome');
        if (welcome) welcome.remove();
  
        const msgDiv = document.createElement('div');
        msgDiv.className = \`flex flex-col max-w-[80%] \${sender === 'user' ? 'self-end items-end' : 'self-start items-start'}\`;
  
        const nameSpan = document.createElement('span');
        nameSpan.className = 'text-xs opacity-50 mb-1 px-1';
        nameSpan.textContent = sender === 'user' ? 'You' : '${APP_NAME}';
  
        const textDiv = document.createElement('div');
        textDiv.className = \`p-3 rounded-xl text-sm whitespace-pre-wrap \${
          sender === 'user' 
            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-tr-none' 
            : isError ? 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 rounded-tl-none border border-red-200' : 'bg-gray-200 text-gray-900 dark:bg-zinc-900 dark:text-zinc-100 rounded-tl-none'
        }\`;
        textDiv.textContent = text;
  
        msgDiv.appendChild(nameSpan);
        msgDiv.appendChild(textDiv);
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
        return textDiv;
      }
  
      chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = userInput.value.trim();
        if (!message) return;
  
        appendMessage('user', message);
        userInput.value = '';
        const botPlaceholder = appendMessage('bot', 'Thinking...');
  
        try {
          const response = await fetch('/api/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: message })
          });
  
          const data = await response.text();
          if (!response.ok) throw new Error(data);
  
          botPlaceholder.textContent = data;
        } catch (error) {
          botPlaceholder.parentElement.remove();
          appendMessage('bot', \`Error: \${error.message}\`, true);
        }
      });
    </script>
  </body>
  </html>
  `;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export const config = { path: ["/", "/api/message"] };
