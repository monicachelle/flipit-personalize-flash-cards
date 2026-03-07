setTimeout(() => {
  // Check if jsPDF is loaded, if not, load it dynamically
  if (typeof window.jspdf === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = initExport;
    document.head.appendChild(script);
  } else {
    initExport();
  }

  function initExport() {
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
    const cardsGrid = document.getElementById('exportCardsGrid');
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const exportFormat = document.getElementById('exportFormat');
    const exportBtn = document.getElementById('exportBtn');
    const previewModal = document.getElementById('previewModal');
    const previewArea = document.getElementById('previewArea');
    const closePreview = document.getElementById('closePreview');
    const downloadExport = document.getElementById('downloadExport');
    const exportedFilesGrid = document.getElementById('exportedFilesGrid');
    const clearAllBtn = document.getElementById('clearAllBtn');

    // Check if elements exist
    if (!cardsGrid) {
        console.error('Export elements not found');
        return;
    }

    // State
    let collection = [];
    let selectedCards = new Set();
    let currentExportData = null;
    let exportedFiles = [];

    // Load exported files from localStorage (user-specific)
    function loadExportedFiles() {
        exportedFiles = JSON.parse(localStorage.getItem(userExportedKey) || '[]');
        renderExportedFiles();
    }

    // Save exported files to localStorage (user-specific)
    function saveExportedFiles() {
        localStorage.setItem(userExportedKey, JSON.stringify(exportedFiles));
    }

    // Load collection from localStorage (user-specific)
    function loadCollection() {
        collection = JSON.parse(localStorage.getItem(userCollectionKey) || '[]');
        renderCards();
        updateExportButton();
    }

    // Render exported files
    function renderExportedFiles() {
      if (!exportedFilesGrid) return;

      if (exportedFiles.length === 0) {
        exportedFilesGrid.innerHTML = `
          <div class="empty-files">
            <p>📁 No exported files yet. Export your first flashcard collection!</p>
          </div>
        `;
        return;
      }

      let html = '';
      exportedFiles.forEach((file, index) => {
        const date = new Date(file.exportedAt);
        const formattedDate = date.toLocaleString();
        
        html += `
          <div class="exported-file-item" data-index="${index}">
            <div class="file-header">
              <span class="file-name">${file.name}</span>
              <span class="file-format-badge">${file.format.toUpperCase()}</span>
            </div>
            <div class="file-actions">
              <button class="file-action-btn file-download-btn" onclick="downloadExportedFile(${index})">📥 Download</button>
              <button class="file-action-btn file-delete-btn" onclick="deleteExportedFile(${index})">🗑️ Delete</button>
            </div>
            <div class="file-info">
              <span>Cards: ${file.cardCount}</span>
              <span>${formattedDate}</span>
            </div>
          </div>
        `;
      });
      
      exportedFilesGrid.innerHTML = html;
    }

    // Download exported file (global for onclick)
    window.downloadExportedFile = function(index) {
      const file = exportedFiles[index];
      if (!file) return;

      if (file.format === 'pdf') {
        // For PDF, we need to recreate from data
        recreateAndDownloadPDF(file.data, file.name);
      } else {
        // For TXT, download the saved content
        const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        link.click();
        URL.revokeObjectURL(url);
      }
      
      showMessage('Download started! 📥');
    };

    // Recreate PDF from saved data
    async function recreateAndDownloadPDF(cardsData, filename) {
      try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = 15;
        const cardWidth = pageWidth - (margin * 2);
        
        let yOffset = margin;

        for (let i = 0; i < cardsData.length; i++) {
          const card = cardsData[i];
          
          if (yOffset > 250 && i > 0) {
            pdf.addPage();
            yOffset = margin;
          }

          pdf.setDrawColor(215, 122, 122);
          pdf.setLineWidth(0.5);
          pdf.roundedRect(margin, yOffset, cardWidth, 60, 5, 5, 'S');

          pdf.setFontSize(12);
          pdf.setTextColor(215, 122, 122);
          pdf.setFont('helvetica', 'bold');
          pdf.text(card.name || 'Untitled Card', margin + 5, yOffset + 8);

          pdf.setDrawColor(255, 224, 224);
          pdf.line(margin + 5, yOffset + 12, pageWidth - margin - 5, yOffset + 12);

          const plainContent = card.content.replace(/<[^>]*>?/gm, '');
          
          pdf.setFontSize(10);
          pdf.setTextColor(51, 51, 51);
          pdf.setFont('helvetica', 'normal');
          
          const splitContent = pdf.splitTextToSize(plainContent, cardWidth - 20);
          pdf.text(splitContent, margin + 5, yOffset + 22);

          pdf.setFontSize(8);
          pdf.setTextColor(160, 103, 103);
          pdf.text(`Card ${i + 1} of ${cardsData.length}`, pageWidth - margin - 30, yOffset + 55);

          yOffset += 70;
        }

        pdf.save(filename);
      } catch (error) {
        console.error('Error recreating PDF:', error);
        showMessage('Error downloading PDF', 'error');
      }
    }

    // Delete exported file (global for onclick)
    window.deleteExportedFile = function(index) {
      if (confirm('Are you sure you want to delete this exported file?')) {
        exportedFiles.splice(index, 1);
        saveExportedFiles();
        renderExportedFiles();
        showMessage('File deleted! 🗑️');
      }
    };

    // Clear all exported files
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        if (exportedFiles.length > 0 && confirm('Delete all exported files?')) {
          exportedFiles = [];
          saveExportedFiles();
          renderExportedFiles();
          showMessage('All files cleared! ✨');
        }
      });
    }

    // Render cards in grid
    function renderCards() {
      if (collection.length === 0) {
        cardsGrid.innerHTML = `
          <div class="empty-collection">
            <p>🌸 No cards available. Go to Design and save some cards first!</p>
          </div>
        `;
        selectAllCheckbox.disabled = true;
        selectAllCheckbox.checked = false;
        return;
      }

      selectAllCheckbox.disabled = false;
      let html = '';

      collection.forEach(card => {
        const date = new Date(card.savedAt || card.createdAt || Date.now());
        const formattedDate = date.toLocaleDateString();
        const isSelected = selectedCards.has(card.id);
        
        html += `
          <div class="export-card-item ${isSelected ? 'selected' : ''}" data-id="${card.id}" onclick="toggleCardSelection('${card.id}')">
            <input type="checkbox" class="card-select-checkbox" 
                   ${isSelected ? 'checked' : ''} 
                   onchange="handleCheckboxChange('${card.id}', this.checked)"
                   onclick="event.stopPropagation()">
            <div class="export-card-header">
              <h3 class="export-card-name">${card.name || 'Untitled Card'}</h3>
            </div>
            <div class="export-card-preview" style="
              font-size: ${card.styles.fontSize};
              color: ${card.styles.textColor};
              background: ${card.styles.bgColor};
              text-align: ${card.styles.textAlign};
            ">
              ${card.content}
            </div>
            <div class="export-card-footer">
              <span>ID: ${card.id.slice(-4)}</span>
              <span>Saved: ${formattedDate}</span>
            </div>
          </div>
        `;
      });
      
      cardsGrid.innerHTML = html;
      updateSelectAllCheckbox();
      updateExportButton();
    }

    // Toggle card selection (global for onclick)
    window.toggleCardSelection = function(cardId) {
      if (selectedCards.has(cardId)) {
        selectedCards.delete(cardId);
      } else {
        selectedCards.add(cardId);
      }
      renderCards();
    };

    // Handle checkbox change (global for onchange)
    window.handleCheckboxChange = function(cardId, checked) {
      if (checked) {
        selectedCards.add(cardId);
      } else {
        selectedCards.delete(cardId);
      }
      renderCards();
    };

    // Select/Deselect all cards
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', function(e) {
        if (e.target.checked) {
          collection.forEach(card => selectedCards.add(card.id));
        } else {
          selectedCards.clear();
        }
        renderCards();
      });
    }

    // Update select all checkbox state
    function updateSelectAllCheckbox() {
      if (collection.length === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
        return;
      }

      const allSelected = collection.every(card => selectedCards.has(card.id));
      const someSelected = collection.some(card => selectedCards.has(card.id));
      
      selectAllCheckbox.checked = allSelected;
      selectAllCheckbox.indeterminate = someSelected && !allSelected;
    }

    // Update export button state
    function updateExportButton() {
      if (exportBtn) {
        exportBtn.disabled = selectedCards.size === 0;
      }
    }

    // Show loading state
    function showLoading() {
      if (cardsGrid) {
        cardsGrid.innerHTML = `
          <div class="export-loading">
            <div class="spinner"></div>
            <p>Preparing your export... ✨</p>
          </div>
        `;
      }
    }

    // Export to PDF
    async function exportToPDF(selectedCardsArray) {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      const cardWidth = pageWidth - (margin * 2);
      
      let yOffset = margin;

      for (let i = 0; i < selectedCardsArray.length; i++) {
        const card = selectedCardsArray[i];
        
        if (yOffset > 250 && i > 0) {
          pdf.addPage();
          yOffset = margin;
        }

        pdf.setDrawColor(215, 122, 122);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(margin, yOffset, cardWidth, 60, 5, 5, 'S');

        pdf.setFontSize(12);
        pdf.setTextColor(215, 122, 122);
        pdf.setFont('helvetica', 'bold');
        pdf.text(card.name || 'Untitled Card', margin + 5, yOffset + 8);

        pdf.setDrawColor(255, 224, 224);
        pdf.line(margin + 5, yOffset + 12, pageWidth - margin - 5, yOffset + 12);

        const plainContent = card.content.replace(/<[^>]*>?/gm, '');
        
        pdf.setFontSize(10);
        pdf.setTextColor(51, 51, 51);
        pdf.setFont('helvetica', 'normal');
        
        const splitContent = pdf.splitTextToSize(plainContent, cardWidth - 20);
        pdf.text(splitContent, margin + 5, yOffset + 22);

        pdf.setFontSize(8);
        pdf.setTextColor(160, 103, 103);
        pdf.text(`Card ${i + 1} of ${selectedCardsArray.length}`, pageWidth - margin - 30, yOffset + 55);

        yOffset += 70;
      }

      return pdf;
    }

    // Export to Text file
    function exportToTXT(selectedCardsArray) {
      let content = 'FLIPIT STUDIO - FLASHCARD EXPORT\n';
      content += '='.repeat(50) + '\n\n';
      content += `Export Date: ${new Date().toLocaleString()}\n`;
      content += `Total Cards: ${selectedCardsArray.length}\n\n`;
      content += '='.repeat(50) + '\n\n';

      selectedCardsArray.forEach((card, index) => {
        const plainContent = card.content.replace(/<[^>]*>?/gm, '');
        
        content += `CARD ${index + 1}: ${card.name || 'Untitled Card'}\n`;
        content += '-'.repeat(30) + '\n';
        content += `${plainContent}\n\n`;
        content += `Styles: Font: ${card.styles.fontSize}, Color: ${card.styles.textColor}\n`;
        content += '='.repeat(50) + '\n\n';
      });

      return content;
    }

    // Save exported file to history
    function saveExportedFile(filename, format, cardsData, content = null) {
      const exportedFile = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        name: filename,
        format: format,
        cardCount: cardsData.length,
        exportedAt: new Date().toISOString(),
        data: cardsData, // Store card data for PDF recreation
        content: content // Store text content for TXT files
      };
      
      exportedFiles.unshift(exportedFile); // Add to beginning
      
      // Keep only last 20 files
      if (exportedFiles.length > 20) {
        exportedFiles = exportedFiles.slice(0, 20);
      }
      
      saveExportedFiles();
      renderExportedFiles();
    }

    // Handle export
    async function handleExport() {
      if (selectedCards.size === 0) return;

      const format = exportFormat.value;
      const selectedCardsArray = collection.filter(card => selectedCards.has(card.id));

      showLoading();

      try {
        if (format === 'pdf') {
          await showPreview();
        } else {
          currentExportData = selectedCardsArray;
          let previewHTML = '<pre style="font-family: monospace; white-space: pre-wrap; background: white; padding: 15px; border-radius: 10px;">';
          previewHTML += exportToTXT(selectedCardsArray);
          previewHTML += '</pre>';
          previewArea.innerHTML = previewHTML;
          previewModal.style.display = 'flex';
        }
      } catch (error) {
        console.error('Export error:', error);
        showMessage('Error preparing export. Please try again.', 'error');
        loadCollection();
      }
    }

    // Download the exported file
    async function downloadFile() {
      if (!currentExportData || currentExportData.length === 0) return;

      const format = exportFormat.value;
      const timestamp = new Date().toISOString().slice(0,19).replace(/:/g, '-');
      const filename = `flashcards_${timestamp}.${format}`;

      try {
        if (format === 'pdf') {
          const pdf = await exportToPDF(currentExportData);
          
          // Save to history first
          saveExportedFile(filename, 'pdf', currentExportData);
          
          // Then download
          pdf.save(filename);
        } else {
          const content = exportToTXT(currentExportData);
          
          // Save to history
          saveExportedFile(filename, 'txt', currentExportData, content);
          
          // Download
          const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.click();
          URL.revokeObjectURL(url);
        }

        previewModal.style.display = 'none';
        showMessage('Export completed successfully! ✨');
        
        // Clear selection after successful export
        selectedCards.clear();
        renderCards();
        
      } catch (error) {
        console.error('Download error:', error);
        showMessage('Error downloading file. Please try again.', 'error');
      }
    }

    // Show preview
    async function showPreview() {
      if (selectedCards.size === 0) return;

      const selectedCardsArray = collection.filter(card => selectedCards.has(card.id));
      currentExportData = selectedCardsArray;

      let previewHTML = '';
      
      selectedCardsArray.forEach((card, index) => {
        previewHTML += `
          <div class="preview-card">
            <div class="preview-card-header">
              Card ${index + 1}: ${card.name || 'Untitled Card'}
            </div>
            <div class="preview-card-content" style="
              font-size: ${card.styles.fontSize};
              color: ${card.styles.textColor};
              background: ${card.styles.bgColor};
              text-align: ${card.styles.textAlign};
              padding: 10px;
              border-radius: 10px;
            ">
              ${card.content}
            </div>
          </div>
        `;
      });

      previewArea.innerHTML = previewHTML;
      previewModal.style.display = 'flex';
    }

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

    // Event Listeners
    if (exportBtn) exportBtn.addEventListener('click', handleExport);
    if (closePreview) closePreview.addEventListener('click', () => {
      previewModal.style.display = 'none';
    });
    if (downloadExport) downloadExport.addEventListener('click', downloadFile);

    // Close preview modal when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target === previewModal) {
        previewModal.style.display = 'none';
      }
    });

    // Initial load
    loadCollection();
    loadExportedFiles();
    
    console.log('Export.js loaded successfully');
  }
}, 100);