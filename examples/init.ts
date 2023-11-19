import './style.css';

export default function initExample(importMeta: ImportMeta, name: string) {
  const [, exampleName] = name.split('example-');
  if (importMeta.hot) {
    importMeta.hot.send('count-request:fetch');
    importMeta.hot.on('count-request:refresh', ({ requestCount, disabled }) => {
      const count = document.querySelector('#count');
      const title = document.querySelector('#title');
      if (count) count.innerHTML = requestCount;
      if (title) title.className = disabled ? 'disabled' : '';
    });
  }

  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <div>
      <h1 id="title">vite-plugin-entry-shaking</h1>
      <h2>${exampleName} example</h2>
      <p><span id="count">0</span> requests were made.</p>
    </div>
  `;
}
