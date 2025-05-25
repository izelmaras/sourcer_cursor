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
  const externalLinkInput = document.getElementById('externalLink');
  const mediaPreview = document.getElementById('mediaPreview');

  // Pre-fill with correct values
  const defaultSupabaseUrl = 'https://mugprkvnyvlzsxekwusx.supabase.co';
  const defaultSupabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11Z3Bya3ZueXZsenN4ZWt3dXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1MTY1MDQsImV4cCI6MjA2MDA5MjUwNH0.nHQ1PtkqwfkPERaBNfoOVYZfgjrvsa-rlh6Goskk-cA';

  // Set defaults if not already set
  const config = await chrome.storage.sync.get(['supabaseUrl', 'supabaseKey']);
  if (!config.supabaseUrl) await chrome.storage.sync.set({ supabaseUrl: defaultSupabaseUrl });
  if (!config.supabaseKey) await chrome.storage.sync.set({ supabaseKey: defaultSupabaseKey });

  // Get media link from storage (set by background.js)
  const { mediaLink, mediaType } = await chrome.storage.local.get(['mediaLink', 'mediaType']);
  if (mediaLink) {
    // Clean video link by removing anything after the extension
    const cleanLink = mediaType === 'video' 
      ? mediaLink.split('.mp4')[0] + '.mp4'
      : mediaLink;
    
    mediaLinkInput.value = cleanLink;
    titleInput.value = 'Untitled';
    
    // Create preview based on media type
    if (mediaType === 'video') {
      const video = document.createElement('video');
      video.src = cleanLink;
      video.controls = true;
      video.autoplay = false;
      mediaPreview.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = cleanLink;
      mediaPreview.appendChild(img);
    }
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
    const mediaUrl = mediaLinkInput.value;
    if (!mediaUrl) {
      updateButtonState('error');
      return;
    }
    // Get Supabase config
    const { supabaseUrl, supabaseKey } = await chrome.storage.sync.get(['supabaseUrl', 'supabaseKey']);
    if (!supabaseUrl || !supabaseKey) {
      updateButtonState('error');
      return;
    }

    updateButtonState('loading');

    // Insert new tags/creators if needed
    const newTags = selectedTags.filter(t => !allTags.includes(t));
    const newCreators = selectedCreators.filter(c => !allCreators.includes(c));
    const link = externalLinkInput.value.trim();
    try {
      // Insert new tags if needed
      if (newTags.length > 0) {
        await fetch(`${supabaseUrl}/rest/v1/tags`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newTags.map(name => ({ name })))
        });
      }

      // Insert new creators if needed
      if (newCreators.length > 0) {
        await fetch(`${supabaseUrl}/rest/v1/creators`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newCreators.map(name => ({ name })))
        });
      }

      // Insert the source with tags array and creator_name
      const sourceRes = await fetch(`${supabaseUrl}/rest/v1/atoms`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          title,
          media_source_link: mediaUrl,
          content_type: mediaType || 'image',
          link,
          tags: selectedTags,
          creator_name: selectedCreators[0] || null
        })
      });

      if (!sourceRes.ok) {
        const errorData = await sourceRes.json().catch(() => null);
        throw new Error(errorData?.message || `Server returned ${sourceRes.status}`);
      }

      updateButtonState('success');
      
      // Clear form after successful save
      setTimeout(() => {
        window.close();
      }, 2000);
    } catch (error) {
      console.error('Error saving source:', error);
      updateButtonState('error');
    }
  });
}); 