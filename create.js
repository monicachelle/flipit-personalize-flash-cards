

setTimeout(() => {
  // State
  let cards = [];
  let currentCardIndex = 0;

  // DOM Elements
  const cardContent = document.getElementById("cardContent");
  const cardFront = document.getElementById("cardFront");
  const prevCardBtn = document.getElementById("prevCardBtn");
  const nextCardBtn = document.getElementById("nextCardBtn");
  const cardIndicator = document.getElementById("cardIndicator");
  const fontSize = document.getElementById("fontSize");
  const textColor = document.getElementById("textColor");
  const bgColor = document.getElementById("bgColor");
  const borderStyle = document.getElementById("borderStyle");
  const borderColor = document.getElementById("borderColor");
  const borderWidth = document.getElementById("borderWidth");
  const borderRadius = document.getElementById("borderRadius");
  const applyStylesBtn = document.getElementById("applyStylesBtn");
  const alignLeftBtn = document.getElementById("alignLeftBtn");
  const alignCenterBtn = document.getElementById("alignCenterBtn");
  const alignRightBtn = document.getElementById("alignRightBtn");
  const saveToCollectionBtn = document.getElementById("saveToCollectionBtn");
  
  // Image elements
  const imageUpload = document.getElementById("imageUpload");
  const uploadImageBtn = document.getElementById("uploadImageBtn");
  const removeImageBtn = document.getElementById("removeImageBtn");
  const imageSize = document.getElementById("imageSize");
  const imagePreview = document.getElementById("imagePreview");
  const previewImg = document.getElementById("previewImg");

  // Create a new card object with unique ID
  function createCard() {
    return {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      name: "Untitled Card",
      content: "Start typing here...",
      images: [],
      styles: {
        fontSize: "18px",
        textColor: "#333333",
        bgColor: "#fff9f0",
        borderStyle: "solid",
        borderColor: "#d77a7a",
        borderWidth: "3px",
        borderRadius: "20px",
        textAlign: "center"
      },
      createdAt: new Date().toISOString()
    };
  }

  // Build complete card HTML with text and images
  function buildCardHTML(card) {
    let html = card.content || "";
    
    if (card.images && card.images.length > 0) {
      card.images.forEach(img => {
        html += `<div class="card-image-container" style="text-align: center; margin: 10px 0;">`;
        html += `<img src="${img.url}" style="max-width: ${img.size || '100px'}; max-height: ${img.size || '100px'}; border-radius: 10px; display: inline-block;">`;
        html += `</div>`;
      });
    }
    
    return html;
  }

  // Update the card display
  function updateCardDisplay() {
    if (!cards.length) return;
    
    const card = cards[currentCardIndex];
    
    // Build complete HTML with text and images
    const completeHTML = buildCardHTML(card);
    cardContent.innerHTML = completeHTML;
    
    // Apply text styles to the content
    cardContent.style.fontSize = card.styles.fontSize;
    cardContent.style.color = card.styles.textColor;
    cardContent.style.textAlign = card.styles.textAlign;
    
    // Apply card styles
    cardFront.style.backgroundColor = card.styles.bgColor;
    cardFront.style.borderStyle = card.styles.borderStyle;
    cardFront.style.borderColor = card.styles.borderColor;
    cardFront.style.borderWidth = card.styles.borderWidth;
    cardFront.style.borderRadius = card.styles.borderRadius;
    
    cardIndicator.textContent = `Card ${currentCardIndex + 1} / ${cards.length}`;
    
    prevCardBtn.disabled = currentCardIndex === 0;
    nextCardBtn.disabled = currentCardIndex === cards.length - 1;
    
    updateImagePreview();
  }

  // Update image preview
  function updateImagePreview() {
    const card = cards[currentCardIndex];
    if (card.images && card.images.length > 0 && previewImg) {
      const lastImage = card.images[card.images.length - 1];
      previewImg.src = lastImage.url;
      imagePreview.style.display = 'block';
    } else if (imagePreview) {
      imagePreview.style.display = 'none';
      previewImg.src = '';
    }
  }

  // Apply styles to whole card
  function applyStylesToCard() {
    if (!cards.length) return;
    
    const card = cards[currentCardIndex];
    
    card.styles.fontSize = fontSize.value;
    card.styles.textColor = textColor.value;
    card.styles.bgColor = bgColor.value;
    card.styles.borderStyle = borderStyle.value;
    card.styles.borderColor = borderColor.value;
    card.styles.borderWidth = borderWidth.value;
    card.styles.borderRadius = borderRadius.value;
    
    updateCardDisplay();
    showMessage("Styles applied to whole card! ✨");
  }

  // NEW IMPROVED FUNCTION: Apply styles to selected text only
  function applyStylesToSelected() {
    if (!cards.length) return;
    
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    // Check if there's selected text
    if (selection.rangeCount === 0 || selectedText.length === 0) {
      // No text selected - apply to whole card
      applyStylesToCard();
      return;
    }
    
    const range = selection.getRangeAt(0);
    
    // Check if the selection is within the cardContent element
    const isInCardContent = cardContent.contains(range.commonAncestorContainer);
    
    if (!isInCardContent) {
      showMessage("Please select text within the card!", "error");
      return;
    }
    
    try {
      // Save current images
      const card = cards[currentCardIndex];
      const currentImages = [...(card.images || [])];
      
      // Get the current HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = cardContent.innerHTML;
      
      // Create a wrapper for the selection
      const span = document.createElement('span');
      span.style.fontSize = fontSize.value;
      span.style.color = textColor.value;
      span.className = 'temp-selected-style';
      
      try {
        // Try to surround the selected content
        range.surroundContents(span);
      } catch (e) {
        // If surroundContents fails (e.g., selection spans multiple elements),
        // use a different approach
        console.log("Using alternative selection method");
        
        // Extract the selected content
        const fragment = range.extractContents();
        
        // Wrap the fragment in our styled span
        const wrapper = document.createElement('span');
        wrapper.style.fontSize = fontSize.value;
        wrapper.style.color = textColor.value;
        wrapper.appendChild(fragment);
        
        // Insert the wrapped content back
        range.insertNode(wrapper);
      }
      
      // Clear selection
      selection.removeAllRanges();
      
      // Update the card content (remove temporary class)
      const updatedHTML = cardContent.innerHTML.replace(/<span class="temp-selected-style">/g, '<span>');
      cardContent.innerHTML = updatedHTML;
      
      // Save the updated content (text only, without images)
      const saveDiv = document.createElement('div');
      saveDiv.innerHTML = cardContent.innerHTML;
      
      // Remove image containers to get only text
      const imageContainers = saveDiv.querySelectorAll('.card-image-container');
      imageContainers.forEach(container => container.remove());
      
      card.content = saveDiv.innerHTML;
      
      // Restore images
      card.images = currentImages;
      
      // Rebuild display
      updateCardDisplay();
      
      showMessage("Styles applied to selected text! ✨");
      
    } catch (e) {
      console.error("Error applying styles to selection:", e);
      showMessage("Please select a continuous piece of text.", "error");
      updateCardDisplay(); // Refresh display
    }
  }

  // Upload image from file
  function uploadImage() {
    if (!cards.length) return;
    
    const file = imageUpload.files[0];
    if (!file) {
      showMessage("Please select an image file!", "error");
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      showMessage("Please select a valid image file!", "error");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      showMessage("Image size should be less than 5MB!", "error");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
      const card = cards[currentCardIndex];
      if (!card.images) card.images = [];
      
      card.images.push({
        url: e.target.result,
        size: imageSize.value,
        addedAt: new Date().toISOString(),
        name: file.name
      });
      
      updateCardDisplay();
      showMessage("Image uploaded! 🖼️");
      imageUpload.value = '';
    };
    
    reader.onerror = function() {
      showMessage("Error reading image file!", "error");
    };
    
    reader.readAsDataURL(file);
  }

  // Remove last image
  function removeImage() {
    if (!cards.length) return;
    
    const card = cards[currentCardIndex];
    if (card.images && card.images.length > 0) {
      card.images.pop();
      updateCardDisplay();
      showMessage("Image removed!");
    } else {
      showMessage("No images to remove!", "error");
    }
  }

  // Save to collection
  function saveToCollection() {
    if (!cards.length) return;
    
    const currentCard = cards[currentCardIndex];
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
      showMessage('Please login first!', 'error');
      return;
    }
    
    const userCollectionKey = `${currentUser}_flashcardCollection`;
    let collection = JSON.parse(localStorage.getItem(userCollectionKey) || '[]');
    
    const existingIndex = collection.findIndex(card => 
      card.content === currentCard.content && 
      JSON.stringify(card.styles) === JSON.stringify(currentCard.styles) &&
      JSON.stringify(card.images) === JSON.stringify(currentCard.images)
    );
    
    if (existingIndex !== -1) {
      collection[existingIndex] = {
        ...currentCard,
        lastModified: new Date().toISOString()
      };
      showMessage("Card updated in collection! 📚");
    } else {
      const cardName = prompt("Enter a name for this flashcard:", "Untitled Card");
      if (cardName === null) return;
      
      collection.push({
        ...currentCard,
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        name: cardName || "Untitled Card",
        savedAt: new Date().toISOString()
      });
      showMessage("Card saved to collection! 📚");
    }
    
    localStorage.setItem(userCollectionKey, JSON.stringify(collection));
  }

  // Show message
  function showMessage(text, type = 'success') {
    const message = document.createElement("div");
    message.className = "message-popup";
    message.textContent = text;
    if (type === 'error') {
      message.style.background = '#ff6b6b';
      message.style.color = 'white';
    }
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 2000);
  }

  // Set alignment
  function setAlignment(alignment) {
    if (!cards.length) return;
    cards[currentCardIndex].styles.textAlign = alignment;
    updateCardDisplay();
    showMessage(`Text aligned ${alignment}! ✨`);
    
    alignLeftBtn.classList.remove('active');
    alignCenterBtn.classList.remove('active');
    alignRightBtn.classList.remove('active');
    
    if (alignment === 'left') alignLeftBtn.classList.add('active');
    else if (alignment === 'center') alignCenterBtn.classList.add('active');
    else if (alignment === 'right') alignRightBtn.classList.add('active');
  }

  // Event Listeners
  cardContent.addEventListener("input", function() {
    if (!cards.length) return;
    
    const card = cards[currentCardIndex];
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cardContent.innerHTML;
    
    const imageContainers = tempDiv.querySelectorAll('.card-image-container');
    imageContainers.forEach(container => container.remove());
    
    card.content = tempDiv.innerHTML;
  });

  prevCardBtn.addEventListener("click", function() {
    if (currentCardIndex > 0) {
      currentCardIndex--;
      updateCardDisplay();
    }
  });

  nextCardBtn.addEventListener("click", function() {
    if (currentCardIndex < cards.length - 1) {
      currentCardIndex++;
      updateCardDisplay();
    }
  });

  applyStylesBtn.addEventListener("click", applyStylesToSelected);
  saveToCollectionBtn.addEventListener("click", saveToCollection);

  alignLeftBtn.addEventListener("click", () => setAlignment("left"));
  alignCenterBtn.addEventListener("click", () => setAlignment("center"));
  alignRightBtn.addEventListener("click", () => setAlignment("right"));

  // Image buttons
  if (uploadImageBtn) uploadImageBtn.addEventListener("click", uploadImage);
  if (removeImageBtn) removeImageBtn.addEventListener("click", removeImage);
  
  // Preview image on file selection
  if (imageUpload) {
    imageUpload.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
          if (previewImg) {
            previewImg.src = e.target.result;
            imagePreview.style.display = 'block';
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Initialize with one card
  cards.push(createCard());
  updateCardDisplay();
  cardContent.contentEditable = "true";
  
  alignCenterBtn.classList.add('active');
  
  console.log("Create.js loaded successfully");
}, 100);