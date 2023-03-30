"use strict";

const addBtns = document.querySelectorAll('.add-btn:not(.solid)');
const saveItemBtns = document.querySelectorAll('.solid');
const addItemContainers = document.querySelectorAll('.add-container');
const addItems = document.querySelectorAll('.add-item');
// Item Lists
const listColumns = document.querySelectorAll('.drag-item-list');
const backlogList = document.getElementById('backlog-list');
const progressList = document.getElementById('progress-list');
const completeList = document.getElementById('complete-list');
const onHoldList = document.getElementById('on-hold-list');

// Items
let updatedOnLoad = false;

// Initialize Arrays
let backlogListArray = [];
let progressListArray = [];
let completeListArray = [];
let onHoldListArray = [];
let listArrays = [];

// Drag Functionality
let draggedItem;
let dragging = false;
let currentColumn;

// Get Arrays from localStorage if available, set default values if not
const getSavedColumns = function () {
  if (localStorage.getItem('backlogItems')) {
    backlogListArray = JSON.parse(localStorage.backlogItems);
    progressListArray = JSON.parse(localStorage.progressItems);
    completeListArray = JSON.parse(localStorage.completeItems);
    onHoldListArray = JSON.parse(localStorage.onHoldItems);
  } else {
    backlogListArray = ['Release the course', 'Sit back and relax'];
    progressListArray = ['Work on projects', 'Listen to music'];
    completeListArray = ['Being cool', 'Getting stuff done'];
    onHoldListArray = ['Being uncool'];
  }
};

// Set localStorage Arrays
const updateSavedColumns = function () {
  listArrays = [backlogListArray, progressListArray, completeListArray, onHoldListArray];
  const arrayNames = ['backlog', 'progress', 'complete', 'onHold'];

  arrayNames.forEach((arrayName, index) => {
    localStorage.setItem(`${arrayName}Items`, JSON.stringify(listArrays[index]));
  })
};

// Filter Array to remove empty values
const filterArray = function (arr) {
  const filteredArray = arr.filter(item => item !== null);
  console.log(filteredArray);
  return filteredArray;
}

// Create DOM Elements for each list item
const createItemEl = function (columnEl, column, item, index) {
  // List Item
  const listEl = document.createElement('li');
  listEl.classList.add('drag-item');
  listEl.textContent = item;
  listEl.draggable = true;
  listEl.setAttribute('ondragstart', 'dragItem(event)');
  listEl.contentEditable = true;
  listEl.id = index;
  listEl.setAttribute('onfocusout', `updateItem(${index}, ${column})`);
  // Append
  columnEl.appendChild(listEl);
};

// Update Columns in DOM - Reset HTML, Filter Array, Update localStorage
const updateDOM = function () {
  // Check localStorage once
  if (!updatedOnLoad) getSavedColumns();

  // Define list categories and their corresponding array
  const listCategories = [backlogList, progressList, completeList, onHoldList];
  listArrays = [backlogListArray, progressListArray, completeListArray, onHoldListArray];

  // Loop over each list category
  listCategories.forEach((listCategory, index) => {
    // Reset the content of the list category
    listCategory.textContent = '';

    // Filter the corresponding array to remove any null values
    listArrays[index] = filterArray(listArrays[index]);

    // Loop over each item in the array and create a new item element
    listArrays[index].forEach((item, itemIndex) => {
      createItemEl(listCategory, index, item, itemIndex);
    });
  });

  // Set updatedOnLoad to true so that getSavedColumns() is not called again
  updatedOnLoad = true;

  // Update the saved columns in local storage
  updateSavedColumns();
};


// Update Item - Delete if necessary, or update Array value
const updateItem = function (id, column) {
  // Get the array and the elements of the selected column
  const selectedArray = listArrays[column];
  const selectedColumnEl = listColumns[column].children;

  // If an item is not being dragged
  if (!dragging) {
    // Get the selected item text content
    const selectedItem = selectedColumnEl[id].textContent.trim();

    // If the selected element is empty, remove the item from the array
    if (!selectedItem) {
      selectedArray.splice(id, 1);
    }
    // Otherwise, update the array with the new value
    else {
      selectedArray[id] = selectedItem;
    }
    // Update the DOM with the new array values
    updateDOM();
  }
}

// Add to Column List, Reset Textbox
const addItemToCol = function (col) {
  const itemText = addItems[col].textContent;
  const selectedArray = listArrays[col];
  selectedArray.push(itemText);
  addItems[col].textContent = '';
  updateDOM();
}

// Show Add Item Input Box
const showInputBox = function (col) {
  addBtns[col].style.visibility = 'hidden';
  saveItemBtns[col].style.display = 'flex';
  addItemContainers[col].style.display = 'flex';
}

// Hide Item Input Box
const hideInputBox = function (col) {
  addBtns[col].style.visibility = 'visible';
  saveItemBtns[col].style.display = 'none';
  addItemContainers[col].style.display = 'none';
  addItemToCol(col);
}

// Allow arrays to reflect Drag and Drop items
const rebuildArrays = function () {
  backlogListArray = Array.from(backlogList.children).map((i) => i.textContent);
  progressListArray = Array.from(progressList.children).map((i) => i.textContent);
  completeListArray = Array.from(completeList.children).map((i) => i.textContent);
  onHoldListArray = Array.from(onHoldList.children).map((i) => i.textContent);

  updateDOM();
}

// When Item Starts Dragging
const dragItem = function (e) {
  draggedItem = e.target;
  dragging = true;
}

// Column Allows for Item to Drop
const allowDropItem = function (e) {
  e.preventDefault();
}

// When Item Enters Column Area
const dragEnterItem = function (col) {
  listColumns[col].classList.add('over');
  currentColumn = col;
}

// Dropping Item in Column
const dropItem = function (e) {
  e.preventDefault();
  // Remove Background Color/Padding
  listColumns.forEach((column) => column.classList.remove('over'));
  // Add item to column
  const parent = listColumns[currentColumn];
  parent.appendChild(draggedItem);
  // Dragging complete
  dragging = false;
  rebuildArrays();
}

// On Load
updateDOM();