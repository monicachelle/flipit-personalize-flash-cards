setTimeout(() => {
    // Get current user
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        showMessage('Please login first!', 'error');
        return;
    }
    
    // Use user-specific keys
    const userCollectionKey = `${currentUser}_flashcardCollection`;
    const userExportedKey = `${currentUser}_exportedFlashcardFiles`;
    
    // DOM Elements
    const sourceCollection = document.getElementById('sourceCollection');
    const sourceExported = document.getElementById('sourceExported');
    const collectionView = document.getElementById('collectionView');
    const exportedView = document.getElementById('exportedView');
    const reviewSection = document.getElementById('reviewSection');
    
    // Collection elements
    const cardsGridSelector = document.getElementById('cardsGridSelector');
    const selectAllCards = document.getElementById('selectAllCards');
    const startReviewBtn = document.getElementById('startReviewBtn');
    
    // Exported files elements
    const filesGrid = document.getElementById('filesGrid');
    
    // Review elements
    const flashcard = document.getElementById('flashcard');
    const cardFrontContent = document.getElementById('cardFrontContent');
    const cardBackContent = document.getElementById('cardBackContent');
    const prevCardBtn = document.getElementById('prevCardBtn');
    const nextCardBtn = document.getElementById('nextCardBtn');
    const cardCounter = document.getElementById('cardCounter');
    const reviewStats = document.getElementById('reviewStats');
    const reviewSourceName = document.getElementById('reviewSourceName');
    const exitReviewBtn = document.getElementById('exitReviewBtn');
    const flashcardWrapper = document.getElementById('flashcardWrapper');

    // State
    let collection = [];
    let exportedFiles = [];
    let selectedCards = new Set();
    let currentReviewCards = [];
    let currentCardIndex = 0;
    let currentSource = 'collection';
    let currentFileData = null;

    // Load data from localStorage (user-specific)
    function loadData() {
        collection = JSON.parse(localStorage.getItem(userCollectionKey) || '[]');
        exportedFiles = JSON.parse(localStorage.getItem(userExportedKey) || '[]');
        renderCollectionView();
        renderFilesView();
    }
    
    // ... rest of the flip.js code remains the same ...

  // Render collection view with cards
  function renderCollectionView() {
    if (collection.length === 0) {
      cardsGridSelector.innerHTML = `
        <div class="empty-state">
          <p>🌸 No cards in your collection. Go to Design and create some!</p>
        </div>
      `;
      selectAllCards.disabled = true;
      startReviewBtn.disabled = true;
      return;
    }

    selectAllCards.disabled = false;
    let html = '';

    collection.forEach(card => {
      const isSelected = selectedCards.has(card.id);
      const plainContent = card.content.replace(/<[^>]*>?/gm, '').substring(0, 50);
      
      html += `
        <div class="card-select-item ${isSelected ? 'selected' : ''}" data-id="${card.id}" onclick="toggleCardSelection('${card.id}')">
          <div class="card-select-checkbox">
            <input type="checkbox" 
                   ${isSelected ? 'checked' : ''} 
                   onchange="handleCardCheckboxChange('${card.id}', this.checked)"
                   onclick="event.stopPropagation()">
            <span>${card.name || 'Untitled Card'}</span>
          </div>
          <div class="card-select-preview" style="
            font-size: ${card.styles.fontSize};
            color: ${card.styles.textColor};
            background: ${card.styles.bgColor};
          ">
            ${plainContent}${plainContent.length >= 50 ? '...' : ''}
          </div>
        </div>
      `;
    });

    cardsGridSelector.innerHTML = html;
    updateSelectAllCheckbox();
    updateStartReviewButton();
  }

  // Render exported files view
  function renderFilesView() {
    if (exportedFiles.length === 0) {
      filesGrid.innerHTML = `
        <div class="empty-state">
          <p>📁 No exported files yet. Go to Export and create some!</p>
        </div>
      `;
      return;
    }

    let html = '';

    exportedFiles.forEach((file, index) => {
      const date = new Date(file.exportedAt);
      const formattedDate = date.toLocaleDateString();
      
      html += `
        <div class="file-item" onclick="selectExportedFile(${index})">
          <div class="file-item-header">
            <span class="file-item-name">${file.name}</span>
            <span class="file-item-format">${file.format.toUpperCase()}</span>
          </div>
          <div class="file-item-info">
            <span>Cards: ${file.cardCount}</span>
            <span>${formattedDate}</span>
          </div>
        </div>
      `;
    });

    filesGrid.innerHTML = html;
  }

  // Toggle card selection (global)
  window.toggleCardSelection = function(cardId) {
    if (selectedCards.has(cardId)) {
      selectedCards.delete(cardId);
    } else {
      selectedCards.add(cardId);
    }
    renderCollectionView();
  };

  // Handle card checkbox change (global)
  window.handleCardCheckboxChange = function(cardId, checked) {
    if (checked) {
      selectedCards.add(cardId);
    } else {
      selectedCards.delete(cardId);
    }
    renderCollectionView();
  };

  // Select exported file (global)
  window.selectExportedFile = function(index) {
    const file = exportedFiles[index];
    if (!file) return;

    // Remove selected class from all files
    document.querySelectorAll('.file-item').forEach(item => {
      item.classList.remove('selected');
    });

    // Add selected class to clicked file
    const fileElement = document.querySelectorAll('.file-item')[index];
    if (fileElement) {
      fileElement.classList.add('selected');
    }

    // Start review with exported file
    startReviewWithExportedFile(file);
  };

  // Update select all checkbox state
  function updateSelectAllCheckbox() {
    if (collection.length === 0) {
      selectAllCards.checked = false;
      selectAllCards.indeterminate = false;
      return;
    }

    const allSelected = collection.every(card => selectedCards.has(card.id));
    const someSelected = collection.some(card => selectedCards.has(card.id));
    
    selectAllCards.checked = allSelected;
    selectAllCards.indeterminate = someSelected && !allSelected;
  }

  // Update start review button state
  function updateStartReviewButton() {
    startReviewBtn.disabled = selectedCards.size === 0;
  }

  // Select/Deselect all cards
  if (selectAllCards) {
    selectAllCards.addEventListener('change', function(e) {
      if (e.target.checked) {
        collection.forEach(card => selectedCards.add(card.id));
      } else {
        selectedCards.clear();
      }
      renderCollectionView();
    });
  }

  // Source selection
  sourceCollection.addEventListener('click', function() {
    sourceCollection.classList.add('active');
    sourceExported.classList.remove('active');
    collectionView.style.display = 'block';
    exportedView.style.display = 'none';
    currentSource = 'collection';
  });

  sourceExported.addEventListener('click', function() {
    sourceExported.classList.add('active');
    sourceCollection.classList.remove('active');
    exportedView.style.display = 'block';
    collectionView.style.display = 'none';
    currentSource = 'exported';
    renderFilesView();
  });

  // Start review with selected cards from collection
  startReviewBtn.addEventListener('click', function() {
    if (selectedCards.size === 0) return;

    currentReviewCards = collection.filter(card => selectedCards.has(card.id));
    currentSource = 'collection';
    
    // For collection cards, front shows content, back shows same content for now
    // You can modify this to have separate front/back if needed
    startReview('Collection', currentReviewCards);
  });

  // Start review with exported file
  function startReviewWithExportedFile(file) {
    if (file.format === 'pdf' && file.data) {
      currentReviewCards = file.data;
    } else if (file.format === 'txt' && file.content) {
      // For text files, create simple cards from content
      currentReviewCards = [{
        name: file.name,
        content: file.content,
        styles: {
          fontSize: '18px',
          textColor: '#333333',
          bgColor: '#fff9f0',
          textAlign: 'center'
        }
      }];
    } else {
      showMessage('Cannot read file content', 'error');
      return;
    }

    currentSource = 'exported';
    currentFileData = file;
    startReview(file.name, currentReviewCards);
  }

  // Start review session
  function startReview(sourceName, cards) {
    currentCardIndex = 0;
    
    // Hide selection views, show review
    collectionView.style.display = 'none';
    exportedView.style.display = 'none';
    reviewSection.style.display = 'block';
    
    // Update review header
    reviewSourceName.textContent = sourceName;
    
    // Display first card
    displayCurrentCard();
  }

  // Display current card
  function displayCurrentCard() {
    if (currentReviewCards.length === 0) return;

    const card = currentReviewCards[currentCardIndex];
    
    // Reset flip
    flashcard.classList.remove('flipped');
    
    // Apply styles to front
    cardFrontContent.innerHTML = card.content;
    cardFrontContent.style.fontSize = card.styles?.fontSize || '18px';
    cardFrontContent.style.color = card.styles?.textColor || '#333333';
    cardFrontContent.style.textAlign = card.styles?.textAlign || 'center';
    
    // For back, show same content or you can modify this
    // You could show hints, answers, or the same content
    cardBackContent.innerHTML = card.content;
    cardBackContent.style.fontSize = card.styles?.fontSize || '18px';
    cardBackContent.style.color = card.styles?.textColor || '#333333';
    cardBackContent.style.textAlign = card.styles?.textAlign || 'center';
    
    // Update navigation
    updateNavigation();
  }

  // Update navigation buttons and counter
  function updateNavigation() {
    prevCardBtn.disabled = currentCardIndex === 0;
    nextCardBtn.disabled = currentCardIndex === currentReviewCards.length - 1;
    
    cardCounter.textContent = `${currentCardIndex + 1} / ${currentReviewCards.length}`;
    reviewStats.textContent = `${currentCardIndex + 1}/${currentReviewCards.length} cards`;
  }

  // Flip card
  if (flashcardWrapper) {
    flashcardWrapper.addEventListener('click', function() {
      flashcard.classList.toggle('flipped');
    });
  }

  // Previous card
  prevCardBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (currentCardIndex > 0) {
      currentCardIndex--;
      displayCurrentCard();
    }
  });

  // Next card
  nextCardBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (currentCardIndex < currentReviewCards.length - 1) {
      currentCardIndex++;
      displayCurrentCard();
    }
  });

  // Exit review
  exitReviewBtn.addEventListener('click', function() {
    reviewSection.style.display = 'none';
    
    // Show the appropriate view based on current source
    if (currentSource === 'collection' || sourceCollection.classList.contains('active')) {
      collectionView.style.display = 'block';
    } else {
      exportedView.style.display = 'block';
    }
    
    // Clear selection
    selectedCards.clear();
    if (selectAllCards) selectAllCards.checked = false;
    renderCollectionView();
  });

  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (reviewSection.style.display !== 'block') return;
    
    if (e.key === 'ArrowLeft' && !prevCardBtn.disabled) {
      prevCardBtn.click();
    } else if (e.key === 'ArrowRight' && !nextCardBtn.disabled) {
      nextCardBtn.click();
    } else if (e.key === ' ' || e.key === 'Space') {
      e.preventDefault();
      flashcard.classList.toggle('flipped');
    }
  });

  // Show message
  function showMessage(text, type = 'success') {
    const message = document.createElement('div');
    message.className = 'message-popup';
    message.textContent = text;
    if (type === 'error') {
      message.style.background = '#ff6b6b';
      message.style.color = 'white';
    }
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 2000);
  }

  // Initial load
  loadData();
  
  console.log('Flip.js loaded successfully');
}, 100);