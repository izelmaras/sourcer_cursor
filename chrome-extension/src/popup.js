document.addEventListener('DOMContentLoaded', async () => {
  const mediaLinkInput = document.getElementById('mediaLink');
  const titleInput = document.getElementById('title');
  const tagsInput = document.getElementById('tagsInput');
  const creatorsInput = document.getElementById('creatorsInput');
  const tagChips = document.getElementById('tagChips');
  const creatorChips = document.getElementById('creatorChips');
  const tagSuggestionsDiv = document.getElementById('tagSuggestions');
  const creatorSuggestionsDiv = document.getElementById('creatorSuggestions');
  const saveButton = document.getElementById('save');
  const statusDiv = document.getElementById('status');
  const externalLinkInput = document.getElementById('externalLink');

  // Pre-fill with correct values
  const defaultSupabaseUrl = 'https://mugprkvnyvlzsxekwusx.supabase.co';
  const defaultSupabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11Z3Bya3ZueXZsenN4ZWt3dXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1MTY1MDQsImV4cCI6MjA2MDA5MjUwNH0.nHQ1PtkqwfkPERaBNfoOVYZfgjrvsa-rlh6Goskk-cA';

  // Set defaults if not already set
  const config = await chrome.storage.sync.get(['supabaseUrl', 'supabaseKey']);
  if (!config.supabaseUrl) await chrome.storage.sync.set({ supabaseUrl: defaultSupabaseUrl });
  if (!config.supabaseKey) await chrome.storage.sync.set({ supabaseKey: defaultSupabaseKey });

  // Get media link and type from storage (set by background.js)
  const { mediaLink, mediaType } = await chrome.storage.local.get(['mediaLink', 'mediaType']);
  if (mediaLink) {
    mediaLinkInput.value = mediaLink;
    titleInput.value = 'Untitled';
  }

  // Fetch tags and creators from Supabase
  const { supabaseUrl, supabaseKey } = await chrome.storage.sync.get(['supabaseUrl', 'supabaseKey']);
  let allTags = [];
  let allCreators = [];
  try {
    const tagRes = await fetch(`${supabaseUrl}/rest/v1/tags?select=name`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    if (tagRes.ok) {
      allTags = (await tagRes.json()).map(t => t.name);
    }
    const creatorRes = await fetch(`${supabaseUrl}/rest/v1/creators?select=name`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    if (creatorRes.ok) {
      allCreators = (await creatorRes.json()).map(c => c.name);
    }
  } catch (e) {
    // ignore fetch errors for suggestions
  }

  // State for selected tags/creators
  let selectedTags = [];
  let selectedCreators = [];

  // Render chips with SVG remove icon
  function renderChips(container, items, removeFn) {
    container.innerHTML = '';
    items.forEach((item, idx) => {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = item;
      const remove = document.createElement('span');
      remove.className = 'remove';
      remove.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4L12 12M12 4L4 12" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`;
      remove.onclick = () => removeFn(idx);
      chip.appendChild(remove);
      container.appendChild(chip);
    });
  }

  // Tag input logic
  tagsInput.addEventListener('input', () => {
    const val = tagsInput.value.toLowerCase();
    const filtered = allTags.filter(t => t.toLowerCase().includes(val) && !selectedTags.includes(t));
    showSuggestions(tagSuggestionsDiv, filtered, tag => {
      selectedTags.push(tag);
      renderChips(tagChips, selectedTags, removeTag);
      tagsInput.value = '';
      tagSuggestionsDiv.style.display = 'none';
    });
  });
  tagsInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && tagsInput.value.trim()) {
      const val = tagsInput.value.trim();
      if (!selectedTags.includes(val)) {
        selectedTags.push(val);
        renderChips(tagChips, selectedTags, removeTag);
      }
      tagsInput.value = '';
      tagSuggestionsDiv.style.display = 'none';
      e.preventDefault();
    }
  });
  function removeTag(idx) {
    selectedTags.splice(idx, 1);
    renderChips(tagChips, selectedTags, removeTag);
  }

  // Creator input logic
  creatorsInput.addEventListener('input', () => {
    const val = creatorsInput.value.toLowerCase();
    const filtered = allCreators.filter(c => c && c.toLowerCase().includes(val) && !selectedCreators.includes(c));
    showSuggestions(creatorSuggestionsDiv, filtered, creator => {
      selectedCreators.push(creator);
      renderChips(creatorChips, selectedCreators, removeCreator);
      creatorsInput.value = '';
      creatorSuggestionsDiv.style.display = 'none';
    });
  });
  creatorsInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && creatorsInput.value.trim()) {
      const val = creatorsInput.value.trim();
      if (!selectedCreators.includes(val)) {
        selectedCreators.push(val);
        renderChips(creatorChips, selectedCreators, removeCreator);
      }
      creatorsInput.value = '';
      creatorSuggestionsDiv.style.display = 'none';
      e.preventDefault();
    }
  });
  function removeCreator(idx) {
    selectedCreators.splice(idx, 1);
    renderChips(creatorChips, selectedCreators, removeCreator);
  }

  // Suggestions dropdown logic
  function showSuggestions(container, items, onSelect) {
    container.innerHTML = '';
    if (items.length === 0) {
      container.style.display = 'none';
      return;
    }
    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'suggestion';
      div.textContent = item;
      div.onclick = () => onSelect(item);
      container.appendChild(div);
    });
    container.style.display = 'block';
  }
  document.addEventListener('click', (e) => {
    if (!tagSuggestionsDiv.contains(e.target) && e.target !== tagsInput) tagSuggestionsDiv.style.display = 'none';
    if (!creatorSuggestionsDiv.contains(e.target) && e.target !== creatorsInput) creatorSuggestionsDiv.style.display = 'none';
  });

  // Initial render
  renderChips(tagChips, selectedTags, removeTag);
  renderChips(creatorChips, selectedCreators, removeCreator);

  // Function to update button state
  function updateButtonState(state) {
    switch(state) {
      case 'loading':
        saveButton.textContent = 'Saving...';
        saveButton.disabled = true;
        saveButton.style.background = '#666';
        break;
      case 'success':
        saveButton.textContent = 'Saved!';
        saveButton.style.background = '#4CAF50';
        setTimeout(() => {
          saveButton.textContent = 'Add';
          saveButton.disabled = false;
          saveButton.style.background = '#fff';
        }, 2000);
        break;
      case 'error':
        saveButton.textContent = 'Failed';
        saveButton.style.background = '#f44336';
        setTimeout(() => {
          saveButton.textContent = 'Add';
          saveButton.disabled = false;
          saveButton.style.background = '#fff';
        }, 2000);
        break;
      default:
        saveButton.textContent = 'Add';
        saveButton.disabled = false;
        saveButton.style.background = '#fff';
    }
  }

  // Get website URL (current tab)
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs && tabs[0] && tabs[0].url) {
      externalLinkInput.value = tabs[0].url;
    }
  });

  saveButton.addEventListener('click', async () => {
    const titleRaw = titleInput.value.trim();
    const title = titleRaw || (mediaLinkInput.value.split('/').pop() || 'Untitled');
    const media = mediaLinkInput.value;
    if (!media) {
      showStatus('No media link found.', 'error');
      updateButtonState('error');
      return;
    }
    // Get Supabase config
    const { supabaseUrl, supabaseKey } = await chrome.storage.sync.get(['supabaseUrl', 'supabaseKey']);
    if (!supabaseUrl || !supabaseKey) {
      showStatus('Supabase config missing. Please set it in extension options.', 'error');
      updateButtonState('error');
      return;
    }

    updateButtonState('loading');

    // Insert new tags/creators if needed
    const newTags = selectedTags.filter(t => !allTags.includes(t));
    const newCreators = selectedCreators.filter(c => !allCreators.includes(c));
    const link = externalLinkInput.value.trim();
    try {
      if (newTags.length > 0) {
        await fetch(`${supabaseUrl}/rest/v1/tags`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(newTags.map(name => ({ name })))
        });
      }
      if (newCreators.length > 0) {
        await fetch(`${supabaseUrl}/rest/v1/creators`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(newCreators.map(name => ({ name })))
        });
      }
      // Fetch all creators to get their IDs
      const creatorRes = await fetch(`${supabaseUrl}/rest/v1/creators?select=id,name`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      const allCreatorsData = creatorRes.ok ? await creatorRes.json() : [];
      const creatorIds = selectedCreators.map(name => {
        const found = allCreatorsData.find(c => c.name === name);
        return found ? found.id : null;
      }).filter(Boolean);
      // Send to Supabase (legacy creator_name for compatibility)
      const res = await fetch(`${supabaseUrl}/rest/v1/atoms`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          title,
          media_source_link: media,
          content_type: mediaType || 'image',
          tags: selectedTags,
          creator_name: selectedCreators.join(', '),
          link
        })
      });
      if (res.ok) {
        const atomData = await res.json();
        const atomId = atomData && atomData[0] && atomData[0].id;
        // Link all creators to the atom in atom_creators
        if (atomId && creatorIds.length > 0) {
          for (const creator_id of creatorIds) {
            await fetch(`${supabaseUrl}/rest/v1/atom_creators`, {
              method: 'POST',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
              },
              body: JSON.stringify([{ atom_id: atomId, creator_id }])
            });
          }
        }
        showStatus('Saved to database!', 'success');
        updateButtonState('success');
        selectedTags = [];
        selectedCreators = [];
        renderChips(tagChips, selectedTags, removeTag);
        renderChips(creatorChips, selectedCreators, removeCreator);
        titleInput.value = '';
      } else {
        const err = await res.text();
        showStatus('Error: ' + err, 'error');
        updateButtonState('error');
      }
    } catch (error) {
      console.error('Error saving:', error);
      showStatus('Error saving source. Please try again.', 'error');
      updateButtonState('error');
    }
  });

  function showStatus(message, type) {
    if (type === 'success') {
      statusDiv.style.display = 'none';
      return;
    }
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
  }
}); 