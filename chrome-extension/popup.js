// Popup script for Chrome extension

document.addEventListener('DOMContentLoaded', async () => {
  // Get DOM elements
  const loadingEl = document.getElementById('loading');
  const formEl = document.getElementById('form');
  const previewImage = document.getElementById('previewImage');
  const titleInput = document.getElementById('title');
  const descriptionInput = document.getElementById('description');
  const sourceUrlEl = document.getElementById('sourceUrl');
  const imageUrlEl = document.getElementById('imageUrl');
  const tagSearchInput = document.getElementById('tagSearch');
  const creatorSearchInput = document.getElementById('creatorSearch');
  const ideaSearchInput = document.getElementById('ideaSearch');
  const selectedTagsEl = document.getElementById('selectedTags');
  const selectedCreatorsEl = document.getElementById('selectedCreators');
  const selectedIdeasEl = document.getElementById('selectedIdeas');
  const tagDropdown = document.getElementById('tagDropdown');
  const creatorDropdown = document.getElementById('creatorDropdown');
  const ideaDropdown = document.getElementById('ideaDropdown');
  const saveButton = document.getElementById('saveButton');
  const cancelButton = document.getElementById('cancelButton');
  const statusEl = document.getElementById('status');

  // Validate all required elements exist
  if (!loadingEl || !formEl || !previewImage || !titleInput || !descriptionInput || 
      !sourceUrlEl || !imageUrlEl || !tagSearchInput || !creatorSearchInput || 
      !ideaSearchInput || !selectedTagsEl || !selectedCreatorsEl || !selectedIdeasEl ||
      !tagDropdown || !creatorDropdown || !ideaDropdown || !saveButton || 
      !cancelButton || !statusEl) {
    console.error('Missing required DOM elements');
    return;
  }

  // State
  let tags = [];
  let creators = [];
  let ideas = [];
  let selectedTags = [];
  let selectedCreators = [];
  let selectedIdeas = [];
  let apiUrl = 'https://sources.izel.website';

  // Hide loading and show form IMMEDIATELY - don't wait for anything
  // Use both class and direct style to ensure it works
  if (loadingEl) {
    loadingEl.classList.add('hidden');
    loadingEl.style.display = 'none';
  }
  if (formEl) {
    formEl.classList.remove('hidden');
    formEl.style.display = 'block';
  }
  
  // Initialize in background
  initialize().catch(err => {
    console.error('Initialization error:', err);
  });

  async function initialize() {
    try {
      // Load API URL
      chrome.storage.local.get(['apiUrl'], (data) => {
        if (data.apiUrl) {
          apiUrl = data.apiUrl;
        }
        // Load data in background, don't block UI
        loadData().catch(err => console.error('Error loading data:', err));
      });

      // Load pending image data
      chrome.storage.local.get('pendingImage', (data) => {
        try {
          const pendingImage = data.pendingImage;
          
          // Always hide loading and show form FIRST (redundant but safe)
          if (loadingEl) {
            loadingEl.classList.add('hidden');
            loadingEl.style.display = 'none';
          }
          if (formEl) {
            formEl.classList.remove('hidden');
            formEl.style.display = 'block';
          }
          
          if (!pendingImage) {
            showStatus('Right-click on an image and select "Save image to Izel\'s Sources"', 'info');
            return;
          }

          // Populate form
          if (previewImage) previewImage.src = pendingImage.imageUrl;
          if (imageUrlEl) imageUrlEl.textContent = pendingImage.imageUrl;
          if (sourceUrlEl) sourceUrlEl.textContent = pendingImage.pageUrl || '';
          if (titleInput) titleInput.value = pendingImage.pageTitle || '';

          // Try to get page description (non-blocking)
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs[0] && tabs[0].id) {
              chrome.tabs.sendMessage(tabs[0].id, { action: 'getPageInfo' }, (response) => {
                if (response && response.description && descriptionInput) {
                  descriptionInput.value = response.description;
                }
              });
            }
          });
        } catch (error) {
          console.error('Error processing pending image:', error);
          // Ensure form is shown even on error
          if (loadingEl) {
            loadingEl.classList.add('hidden');
            loadingEl.style.display = 'none';
          }
          if (formEl) {
            formEl.classList.remove('hidden');
            formEl.style.display = 'block';
          }
        }
      });
    } catch (error) {
      console.error('Initialization error:', error);
      // Always show form on error
      if (loadingEl) {
        loadingEl.classList.add('hidden');
        loadingEl.style.display = 'none';
      }
      if (formEl) {
        formEl.classList.remove('hidden');
        formEl.style.display = 'block';
      }
    }
  }

  async function loadData() {
    if (!apiUrl) return;
    
    try {
      const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
      
      // Fetch data in parallel
      const [tagsRes, creatorsRes, ideasRes] = await Promise.allSettled([
        fetch(`${baseUrl}/api/get-tags`).catch(e => ({ error: e })),
        fetch(`${baseUrl}/api/get-creators`).catch(e => ({ error: e })),
        fetch(`${baseUrl}/api/get-ideas`).catch(e => ({ error: e }))
      ]);

      // Helper to safely parse response
      const safeParse = async (response) => {
        if (!response || response.error || !response.ok) return null;
        
        const contentType = response.headers?.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          // Check if we got source code
          const text = await response.text();
          if (text.includes('import {') || text.includes('export default')) {
            console.warn('API returned source code - routes may not be deployed');
            return null;
          }
          return null;
        }
        
        try {
          return await response.json();
        } catch (e) {
          console.error('JSON parse error:', e);
          return null;
        }
      };

      // Process tags
      if (tagsRes.status === 'fulfilled' && tagsRes.value && !tagsRes.value.error) {
        const data = await safeParse(tagsRes.value);
        if (data && data.tags) {
          tags = data.tags;
        }
      }

      // Process creators
      if (creatorsRes.status === 'fulfilled' && creatorsRes.value && !creatorsRes.value.error) {
        const data = await safeParse(creatorsRes.value);
        if (data && data.creators) {
          creators = data.creators;
        }
      }

      // Process ideas
      if (ideasRes.status === 'fulfilled' && ideasRes.value && !ideasRes.value.error) {
        const data = await safeParse(ideasRes.value);
        if (data && data.ideas) {
          ideas = data.ideas;
        }
      }

      updateDropdowns();
    } catch (error) {
      console.error('Error loading data:', error);
      // Don't block UI - continue with empty arrays
      updateDropdowns();
    }
  }

  function updateDropdowns() {
    updateTagDropdown();
    updateCreatorDropdown();
    updateIdeaDropdown();
  }

  function updateTagDropdown() {
    if (!tagSearchInput || !tagDropdown) return;
    
    const searchTerm = tagSearchInput.value.toLowerCase();
    const filtered = tags.filter(tag => 
      tag && tag.name && tag.name.toLowerCase().includes(searchTerm) && 
      !selectedTags.includes(tag.name)
    ).slice(0, 10);

    tagDropdown.innerHTML = '';
    if (filtered.length === 0 && searchTerm && !tags.find(t => t && t.name && t.name.toLowerCase() === searchTerm)) {
      const item = document.createElement('div');
      item.className = 'dropdown-item';
      item.textContent = `Create "${searchTerm}"`;
      item.onclick = () => addTag(searchTerm);
      tagDropdown.appendChild(item);
    } else {
      filtered.forEach(tag => {
        if (!tag || !tag.name) return;
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.textContent = tag.name;
        item.onclick = () => addTag(tag.name);
        tagDropdown.appendChild(item);
      });
    }
  }

  function updateCreatorDropdown() {
    if (!creatorSearchInput || !creatorDropdown) return;
    
    const searchTerm = creatorSearchInput.value.toLowerCase();
    const filtered = creators.filter(creator => 
      creator && creator.name && creator.name.toLowerCase().includes(searchTerm) && 
      !selectedCreators.includes(creator.name)
    ).slice(0, 10);

    creatorDropdown.innerHTML = '';
    if (filtered.length === 0 && searchTerm && !creators.find(c => c && c.name && c.name.toLowerCase() === searchTerm)) {
      const item = document.createElement('div');
      item.className = 'dropdown-item';
      item.textContent = `Create "${searchTerm}"`;
      item.onclick = () => addCreator(searchTerm);
      creatorDropdown.appendChild(item);
    } else {
      filtered.forEach(creator => {
        if (!creator || !creator.name) return;
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.textContent = creator.name;
        item.onclick = () => addCreator(creator.name);
        creatorDropdown.appendChild(item);
      });
    }
  }

  function updateIdeaDropdown() {
    if (!ideaSearchInput || !ideaDropdown) return;
    
    const searchTerm = ideaSearchInput.value.toLowerCase();
    const filtered = ideas.filter(idea => 
      idea && (idea.title || '').toLowerCase().includes(searchTerm) && 
      !selectedIdeas.includes(idea.id)
    ).slice(0, 10);

    ideaDropdown.innerHTML = '';
    filtered.forEach(idea => {
      if (!idea || idea.id === undefined) return;
      const item = document.createElement('div');
      item.className = 'dropdown-item';
      item.textContent = idea.title || `Idea #${idea.id}`;
      item.onclick = () => addIdea(idea.id, idea.title || `Idea #${idea.id}`);
      ideaDropdown.appendChild(item);
    });
  }

  function addTag(tagName) {
    if (!selectedTags.includes(tagName)) {
      selectedTags.push(tagName);
      renderSelectedTags();
      tagSearchInput.value = '';
      tagDropdown.classList.remove('show');
    }
  }

  function removeTag(tagName) {
    selectedTags = selectedTags.filter(t => t !== tagName);
    renderSelectedTags();
  }

  function renderSelectedTags() {
    if (!selectedTagsEl) return;
    selectedTagsEl.innerHTML = '';
    selectedTags.forEach(tag => {
      if (!tag) return;
      const item = document.createElement('span');
      item.className = 'selected-item';
      item.innerHTML = `${escapeHtml(tag)} <span class="remove" data-tag="${escapeHtml(tag)}">×</span>`;
      const removeBtn = item.querySelector('.remove');
      if (removeBtn) {
        removeBtn.onclick = (e) => {
          e.stopPropagation();
          removeTag(tag);
        };
      }
      selectedTagsEl.appendChild(item);
    });
  }

  function addCreator(creatorName) {
    if (!selectedCreators.includes(creatorName)) {
      selectedCreators.push(creatorName);
      renderSelectedCreators();
      creatorSearchInput.value = '';
      creatorDropdown.classList.remove('show');
    }
  }

  function removeCreator(creatorName) {
    selectedCreators = selectedCreators.filter(c => c !== creatorName);
    renderSelectedCreators();
  }

  function renderSelectedCreators() {
    if (!selectedCreatorsEl) return;
    selectedCreatorsEl.innerHTML = '';
    selectedCreators.forEach(creator => {
      if (!creator) return;
      const item = document.createElement('span');
      item.className = 'selected-item';
      item.innerHTML = `${escapeHtml(creator)} <span class="remove" data-creator="${escapeHtml(creator)}">×</span>`;
      const removeBtn = item.querySelector('.remove');
      if (removeBtn) {
        removeBtn.onclick = (e) => {
          e.stopPropagation();
          removeCreator(creator);
        };
      }
      selectedCreatorsEl.appendChild(item);
    });
  }

  function addIdea(ideaId, ideaTitle) {
    if (!selectedIdeas.includes(ideaId)) {
      selectedIdeas.push(ideaId);
      renderSelectedIdeas();
      ideaSearchInput.value = '';
      ideaDropdown.classList.remove('show');
    }
  }

  function removeIdea(ideaId) {
    selectedIdeas = selectedIdeas.filter(id => id !== ideaId);
    renderSelectedIdeas();
  }

  function renderSelectedIdeas() {
    if (!selectedIdeasEl) return;
    selectedIdeasEl.innerHTML = '';
    selectedIdeas.forEach(ideaId => {
      if (ideaId === undefined || ideaId === null) return;
      const idea = ideas.find(i => i && i.id === ideaId);
      const title = idea ? (idea.title || `Idea #${ideaId}`) : `Idea #${ideaId}`;
      const item = document.createElement('span');
      item.className = 'selected-item';
      item.innerHTML = `${escapeHtml(title)} <span class="remove" data-idea="${ideaId}">×</span>`;
      const removeBtn = item.querySelector('.remove');
      if (removeBtn) {
        removeBtn.onclick = (e) => {
          e.stopPropagation();
          removeIdea(ideaId);
        };
      }
      selectedIdeasEl.appendChild(item);
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Event listeners
  if (tagSearchInput && tagDropdown) {
    tagSearchInput.addEventListener('input', () => {
      updateTagDropdown();
      tagDropdown.classList.add('show');
    });

    tagSearchInput.addEventListener('focus', () => {
      updateTagDropdown();
      tagDropdown.classList.add('show');
    });
  }

  if (creatorSearchInput && creatorDropdown) {
    creatorSearchInput.addEventListener('input', () => {
      updateCreatorDropdown();
      creatorDropdown.classList.add('show');
    });

    creatorSearchInput.addEventListener('focus', () => {
      updateCreatorDropdown();
      creatorDropdown.classList.add('show');
    });
  }

  if (ideaSearchInput && ideaDropdown) {
    ideaSearchInput.addEventListener('input', () => {
      updateIdeaDropdown();
      ideaDropdown.classList.add('show');
    });

    ideaSearchInput.addEventListener('focus', () => {
      updateIdeaDropdown();
      ideaDropdown.classList.add('show');
    });
  }

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown-container')) {
      tagDropdown.classList.remove('show');
      creatorDropdown.classList.remove('show');
      ideaDropdown.classList.remove('show');
    }
  });

  // Save button
  if (saveButton) {
    saveButton.addEventListener('click', async () => {
      if (!imageUrlEl || !sourceUrlEl || !titleInput || !descriptionInput) {
        showStatus('Form elements not found', 'error');
        return;
      }
      
      const imageUrl = imageUrlEl.textContent;
      const sourceUrl = sourceUrlEl.textContent;
      const title = titleInput.value.trim();
      const description = descriptionInput.value.trim();

      if (!imageUrl) {
        showStatus('No image URL found', 'error');
        return;
      }

      if (!saveButton) return;
      
      saveButton.disabled = true;
      saveButton.textContent = 'Saving...';
      showStatus('Saving...', 'info');

      try {
        const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
        
        const atomData = {
          title: title || 'Untitled',
          description: description || '',
          media_source_link: imageUrl,
          link: sourceUrl || null,
          content_type: 'image',
          tags: selectedTags.length > 0 ? selectedTags : [],
          creator_name: selectedCreators.length > 0 ? selectedCreators.join(', ') : null,
          store_in_database: true
        };

        const response = await fetch(`${baseUrl}/api/add-atom`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(atomData)
        });

        if (!response.ok) {
          // Clone response to read it safely
          const responseClone = response.clone();
          const contentType = response.headers.get('content-type') || '';
          let errorText = '';
          
          if (contentType.includes('application/json')) {
            try {
              const errorData = await responseClone.json();
              errorText = errorData.error || errorData.message || '';
              if (errorData.details) {
                errorText += ` (${errorData.details})`;
              }
              if (errorData.hint) {
                errorText += ` - ${errorData.hint}`;
              }
            } catch {
              errorText = `HTTP ${response.status}`;
            }
          } else {
            try {
              const text = await response.text();
              // Check if we got source code
              if (text.includes('import {') || text.includes('export default')) {
                errorText = 'API routes not deployed. Please deploy to Vercel.';
              } else {
                errorText = text.substring(0, 100);
              }
            } catch {
              errorText = `HTTP ${response.status}`;
            }
          }
          
          throw new Error(`Failed to save: ${errorText}`);
        }

        const result = await response.json();
        
        // Link to ideas if selected
        if (selectedIdeas.length > 0 && result.atom) {
          for (const ideaId of selectedIdeas) {
            try {
              await fetch(`${baseUrl}/api/add-child-atom`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  parentAtomId: ideaId,
                  childAtomId: result.atom.id
                })
              });
            } catch (error) {
              console.error('Error linking to idea:', error);
            }
          }
        }
        
        showStatus('Saved successfully!', 'success');
        chrome.storage.local.remove('pendingImage');
        
        setTimeout(() => {
          window.close();
        }, 1500);

      } catch (error) {
        console.error('Error saving:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        showStatus(`Error: ${errorMessage}`, 'error');
        if (saveButton) {
          saveButton.disabled = false;
          saveButton.textContent = 'Save';
        }
      }
    });
  }

  // Cancel button
  if (cancelButton) {
    cancelButton.addEventListener('click', () => {
      chrome.storage.local.remove('pendingImage');
      window.close();
    });
  }

  function showStatus(message, type) {
    if (!statusEl) {
      console.log(`Status: ${message} (${type})`);
      return;
    }
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
    statusEl.classList.remove('hidden');
  }
});
