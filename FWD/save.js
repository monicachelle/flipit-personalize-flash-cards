setTimeout(() => {
  // DOM Elements
  const cardsGrid = document.getElementById('cardsGrid');
  const totalCardsEl = document.getElementById('totalCards');
  const refreshBtn = document.getElementById('refreshCollection');
  
  // Modal Elements
  const editModal = document.getElementById('editModal');
  const deleteModal = document.getElementById('deleteModal');
  const editCardName = document.getElementById('editCardName');
  const editCardContent = document.getElementById('editCardContent');
  const editFontSize = document.getElementById('editFontSize');
  const editTextColor = document.getElementById('editTextColor');
  const editBgColor = document.getElementById('editBgColor');
  const editTextAlign = document.getElementById('editTextAlign');
  const cancelEdit = document.getElementById('cancelEdit');
  const saveEdit = document.getElementById('saveEdit');
  const cancelDelete = document.getElementById('cancelDelete');
  const confirmDelete = document.getElementById('confirmDelete');

  // State
  let collection = [];
  let currentCardId = null;
  let cardToDelete = null;

  // Load collection from localStorage
  // Load collection from localStorage (user-specific)
function loadCollection() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        cardsGrid.innerHTML = `
            <div class="empty-collection">
                <p>⚠️ Please login first!</p>
            </div>
        `;
        return;
    }
    
    const userCollectionKey = `${currentUser}_flashcardCollection`;
    collection = JSON.parse(localStorage.getItem(userCollectionKey) || '[]');
    renderCards();
}

  // Render cards in grid
  function renderCards() {
    if (collection.length === 0) {
      cardsGrid.innerHTML = `
        <div class="empty-collection">
          <p>🌸 No cards saved yet. Go to Design and save your first card!</p>
        </div>
      `;
      totalCardsEl.textContent = '0 cards';
      return;
    }

    let html = '';
    collection.forEach(card => {
      const date = new Date(card.savedAt || card.createdAt);
      const formattedDate = date.toLocaleDateString();
      
      html += `
        <div class="card-item" data-id="${card.id}">
          <div class="card-header">
            <h3 class="card-name">${card.name || 'Untitled Card'}</h3>
            <div class="card-actions">
              <button class="card-action-btn edit-btn" onclick="editCard('${card.id}')">✏️ Edit</button>
              <button class="card-action-btn delete-btn" onclick="deleteCard('${card.id}')">🗑️ Delete</button>
            </div>
          </div>
          <div class="card-preview" style="
            font-size: ${card.styles.fontSize};
            color: ${card.styles.textColor};
            background: ${card.styles.bgColor};
            text-align: ${card.styles.textAlign};
            border: 2px ${card.styles.borderStyle} ${card.styles.borderColor};
            border-radius: ${card.styles.borderRadius};
          ">
            ${card.content}
          </div>
          <div class="card-footer">
            Saved: ${formattedDate}
          </div>
        </div>
      `;
    });
    
    cardsGrid.innerHTML = html;
    totalCardsEl.textContent = `${collection.length} card${collection.length !== 1 ? 's' : ''}`;
  }

  // Edit card function (global for onclick)
  window.editCard = function(cardId) {
    const card = collection.find(c => c.id === cardId);
    if (!card) return;
    
    currentCardId = cardId;
    editCardName.value = card.name || 'Untitled Card';
    editCardContent.value = card.content.replace(/<[^>]*>?/gm, '');
    editFontSize.value = card.styles.fontSize;
    editTextColor.value = card.styles.textColor;
    editBgColor.value = card.styles.bgColor;
    editTextAlign.value = card.styles.textAlign;
    
    editModal.style.display = 'flex';
  };

  // Delete card function (global for onclick)
  window.deleteCard = function(cardId) {
    cardToDelete = cardId;
    deleteModal.style.display = 'flex';
  };

  // Save edit changes
  function saveEditChanges() {
    if (!currentCardId) return;
    
    const index = collection.findIndex(c => c.id === currentCardId);
    if (index === -1) return;
    
    // Update card
    collection[index] = {
      ...collection[index],
      name: editCardName.value || 'Untitled Card',
      content: editCardContent.value || 'Empty card',
      styles: {
        ...collection[index].styles,
        fontSize: editFontSize.value,
        textColor: editTextColor.value,
        bgColor: editBgColor.value,
        textAlign: editTextAlign.value
      },
      lastModified: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('flashcardCollection', JSON.stringify(collection));
    
    // Close modal and refresh
    editModal.style.display = 'none';
    renderCards();
    showMessage('Card updated! ✨');
  }

  // Confirm delete
  function confirmDeleteCard() {
    if (!cardToDelete) return;
    
    collection = collection.filter(c => c.id !== cardToDelete);
    localStorage.setItem('flashcardCollection', JSON.stringify(collection));
    
    deleteModal.style.display = 'none';
    cardToDelete = null;
    renderCards();
    showMessage('Card deleted! 🗑️');
  }

  // Show message
  function showMessage(text) {
    const message = document.createElement('div');
    message.className = 'message-popup';
    message.textContent = text;
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 2000);
  }

  // Event Listeners
  refreshBtn.addEventListener('click', loadCollection);
  
  cancelEdit.addEventListener('click', () => {
    editModal.style.display = 'none';
    currentCardId = null;
  });
  
  saveEdit.addEventListener('click', saveEditChanges);
  
  cancelDelete.addEventListener('click', () => {
    deleteModal.style.display = 'none';
    cardToDelete = null;
  });
  
  confirmDelete.addEventListener('click', confirmDeleteCard);

  // Close modals when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === editModal) {
      editModal.style.display = 'none';
      currentCardId = null;
    }
    if (e.target === deleteModal) {
      deleteModal.style.display = 'none';
      cardToDelete = null;
    }
  });

  // Initial load
  loadCollection();
  
  console.log('Save.js loaded successfully');
}, 100);