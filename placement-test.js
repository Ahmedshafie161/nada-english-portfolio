/* Content comes from the supplied assessment; audio follows attachment order. */
function parsePlacementTest(source) {
  const text = source.replace(/\r/g, '');
  const between = (start, end) => text.split(start)[1].split(end)[0].trim();
  const numbered = (content, pattern) => [...content.matchAll(pattern)].map(match => ({
    prompt: match[1].trim(),
    options: match[2].trim().split('\n').map(value => value.trim()).filter(Boolean)
  }));
  const grammar = numbered(text.split('\n1. C')[0], /\d+\) (.+)\n([\s\S]*?)(?=\n\d+\) |$)/g);
  const trueFalse = content => [...content.matchAll(/^\d+\. (.+)$/gm)].map(match => ({
    prompt: match[1].split('❏')[0].trim(), options: ['True', 'False']
  }));
  const firstReading = between('Hello, People of Thailand!', '\nAnswer:');
  const secondReading = between('Read the notice and mark the sentences below: "True" or "False".', '\nAnswers:');
  const changing = between('Changing plans\nTask 1', '\nAnswer:');
  const phone = between('A phone call from a customer\nTask 2', '\nAnswer key:');
  const lecture = text.split('Circle the best answer.')[1].split('\n1. b 2. c')[0];
  return [
    { title: 'Grammar & use of English', questions: grammar,
      // Correct the supplied key: “giving … a wipe” and “almost a month ago”.
      answers: [2,1,0,2,0,2,1,1,2,1,3,2,1,3,1,3,3,1,2,0,1,0,1,0,2] },
    { title: 'Reading · Part 1', passage: 'Hello, People of Thailand!\n\n' + firstReading.split('\n1.')[0], questions: trueFalse(firstReading), answers: [0,0,1,0,0] },
    { title: 'Reading · Part 2', passage: secondReading.split('\n1.')[0], questions: trueFalse(secondReading), answers: [1,0,0,0,1] },
    { title: 'Listening · Part 1: Changing plans', audio: 'assets/listening-1.mpeg',
      questions: [...changing.matchAll(/^\d+\. (.+)$/gm)].map(match => ({ prompt: match[1], options: ['Francesco', 'Sachi'] })), answers: [0,1,0,0,1,1,1,0] },
    { title: 'Listening · Part 2: A phone call from a customer', audio: 'assets/listening-2.mpeg', questions: trueFalse(phone), answers: [1,0,1,1,0,0] },
    { title: 'Listening · Part 3: A lecture about an experiment', audio: 'assets/listening-3.mpeg',
      questions: numbered(lecture, /\d+\. (.+)\n([\s\S]*?)(?=\n\d+\. |$)/g).map(question => ({ ...question, options: question.options.map(option => option.replace(/^[a-c]\. /, '')) })), answers: [1,2,0,0,2,0] }
  ];
}

function renderPlacementTest(parts) {
  const container = document.getElementById('test-sections');
  parts.forEach((part, partIndex) => {
    const section = document.createElement('section');
    section.className = 'test-part';
    const heading = document.createElement('h2');
    heading.textContent = part.title;
    section.append(heading);
    if (part.passage) {
      const passage = document.createElement('div');
      passage.className = 'reading-passage';
      part.passage.split(/\n\s*\n/).forEach(text => {
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        passage.append(paragraph);
      });
      section.append(passage);
    }
    if (part.audio) {
      const instructions = document.createElement('p');
      instructions.textContent = 'Listen to the recording, then answer the questions below.';
      const audio = document.createElement('audio');
      audio.controls = true;
      audio.preload = 'metadata';
      audio.src = part.audio;
      audio.setAttribute('aria-label', part.title + ' recording');
      const fallback = document.createElement('a');
      fallback.href = part.audio;
      fallback.className = 'audio-download';
      fallback.textContent = 'Open audio recording separately';
      section.append(instructions, audio, fallback);
    }
    part.questions.forEach((question, questionIndex) => {
      const fieldset = document.createElement('fieldset');
      const legend = document.createElement('legend');
      legend.textContent = `${questionIndex + 1}. ${question.prompt}`;
      fieldset.append(legend);
      question.options.forEach((option, optionIndex) => {
        const label = document.createElement('label');
        label.className = 'test-option';
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = `part-${partIndex}-question-${questionIndex}`;
        input.value = optionIndex;
        input.required = true;
        label.append(input, document.createTextNode(option));
        fieldset.append(label);
      });
      section.append(fieldset);
    });
    container.append(section);
  });
  const form = document.getElementById('placement-form');
  form.hidden = false;
  document.getElementById('load-status').textContent = '55 questions · 25 grammar, 10 reading and 20 listening';
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const breakdown = document.getElementById('result-breakdown');
    breakdown.replaceChildren();
    let total = 0;
    parts.forEach((part, partIndex) => {
      const score = part.answers.reduce((sum, answer, questionIndex) => sum + (data.get(`part-${partIndex}-question-${questionIndex}`) === String(answer) ? 1 : 0), 0);
      total += score;
      const line = document.createElement('p');
      line.textContent = `${part.title}: ${score} / ${part.questions.length}`;
      breakdown.append(line);
    });
    document.getElementById('result-name').textContent = data.get('student-name') || 'Completed assessment';
    document.getElementById('result-score').textContent = `${total} / 55 · ${Math.round(total / 55 * 100)}%`;
    const result = document.getElementById('test-result');
    result.hidden = false;
    result.focus();
    result.scrollIntoView({ behavior: 'auto', block: 'start' });
  });
}

if (typeof document !== 'undefined') {
  fetch('assets/placement-test.txt').then(response => {
    if (!response.ok) throw new Error('Unable to load test');
    return response.text();
  }).then(source => renderPlacementTest(parsePlacementTest(source))).catch(() => {
    document.getElementById('load-status').textContent = 'The test could not load. Please refresh or try again later.';
  });
}
