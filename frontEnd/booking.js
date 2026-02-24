// Booking Modal JavaScript

// Get DOM elements
const modal = document.getElementById('bookingModal');
const closeBtn = document.querySelector('.close');
const bookingForm = document.getElementById('bookingForm');
const bookingMessage = document.getElementById('bookingMessage');
const bookBtns = document.querySelectorAll('.book-btn');
const serviceTypeSelect = document.getElementById('serviceType');

// Calendar variables
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDate = null;
let selectedTime = null;

// Define time slots for each day of the week (0 = Sunday, 6 = Saturday)
const daySchedule = {
  0: { // Sunday
    name: 'Sunday',
    slots: [
      { time: '07:00', display: '7:00 AM' },
      { time: '07:30', display: '7:30 AM' },
      { time: '08:00', display: '8:00 AM' },
      { time: '08:30', display: '8:30 AM' },
      { time: '09:00', display: '9:00 AM' },
      { time: '09:30', display: '9:30 AM' },
      { time: '10:00', display: '10:00 AM' },
      { time: '10:30', display: '10:30 AM' },
      { time: '11:00', display: '11:00 AM' },
      { time: '11:30', display: '11:30 AM' },
      { time: '12:00', display: '12:00 PM' },
      { time: '12:30', display: '12:30 PM' },
      { time: '13:00', display: '1:00 PM' },
      { time: '13:30', display: '1:30 PM' },
      { time: '14:00', display: '2:00 PM' },
      { time: '14:30', display: '2:30 PM' },
      { time: '15:00', display: '3:00 PM' },
      { time: '15:30', display: '3:30 PM' },
      { time: '16:00', display: '4:00 PM' },
      { time: '16:30', display: '4:30 PM' },
      { time: '17:00', display: '5:00 PM' },
      { time: '17:30', display: '5:30 PM' },
      { time: '18:00', display: '6:00 PM' },
      { time: '18:30', display: '6:30 PM' }
    ]
  },
  1: { // Monday
    name: 'Monday',
    slots: [
      { time: '06:00', display: '6:00 PM' },
      { time: '06:30', display: '6:30 PM' },
      { time: '07:00', display: '7:00 PM' },
      { time: '07:30', display: '7:30 PM' }
    ]
  },
  2: { // Tuesday
    name: 'Tuesday',
    slots: [
      { time: '04:30', display: '4:30 PM' },
      { time: '05:00', display: '5:00 PM' },
      { time: '06:00', display: '6:00 PM' },
      { time: '06:30', display: '6:30 PM' },
      { time: '07:00', display: '7:00 PM' },
      { time: '07:30', display: '7:30 PM' }
    ]
  },
  3: { // Wednesday
    name: 'Wednesday',
    slots: [
      { time: '04:30', display: '4:30 PM' },
      { time: '05:00', display: '5:00 PM' },
      { time: '06:00', display: '6:00 PM' },
      { time: '06:30', display: '6:30 PM' },
      { time: '07:00', display: '7:00 PM' },
      { time: '07:30', display: '7:30 PM' }
    ]
  },
  4: { // Thursday
    name: 'Thursday',
    slots: [
      { time: '09:00', display: '9:00 AM' },
      { time: '09:30', display: '9:30 AM' },
      { time: '10:00', display: '10:00 AM' },
      { time: '10:30', display: '10:30 AM' },
      { time: '11:00', display: '11:00 AM' },
      { time: '11:30', display: '11:30 AM' },
      { time: '12:00', display: '12:00 PM' },
      { time: '12:30', display: '12:30 PM' },
      
      { time: '18:00', display: '6:00 PM' },
      { time: '18:30', display: '6:30 PM' }
    ]
  },
  5: { // Friday
    name: 'Friday',
    slots: [
      { time: '06:00', display: '6:00 PM' },
      { time: '06:30', display: '6:30 PM' },
      { time: '07:00', display: '7:00 PM' },
      { time: '07:30', display: '7:30 PM' }
    ]
  },
  6: { // Saturday
    name: 'Saturday',
    slots: [
      { time: '07:00', display: '7:00 AM' },
      { time: '07:30', display: '7:30 AM' },
      { time: '08:00', display: '8:00 AM' },
      { time: '08:30', display: '8:30 AM' },
      { time: '09:00', display: '9:00 AM' },
      { time: '09:30', display: '9:30 AM' },
      { time: '10:00', display: '10:00 AM' },
      { time: '10:30', display: '10:30 AM' },
      { time: '11:00', display: '11:00 AM' },
      { time: '11:30', display: '11:30 AM' },
      { time: '12:00', display: '12:00 PM' },
      { time: '12:30', display: '12:30 PM' },
      { time: '13:00', display: '1:00 PM' },
      { time: '13:30', display: '1:30 PM' },
      { time: '14:00', display: '2:00 PM' },
      { time: '14:30', display: '2:30 PM' },
      { time: '15:00', display: '3:00 PM' },
      { time: '15:30', display: '3:30 PM' },
      { time: '16:00', display: '4:00 PM' },
      { time: '16:30', display: '4:30 PM' },
      { time: '17:00', display: '5:00 PM' },
      { time: '17:30', display: '5:30 PM' },
      { time: '18:00', display: '6:00 PM' },
      { time: '18:30', display: '6:30 PM' }
    ]
  }
};

// Open modal when any "Book Service" button is clicked
bookBtns.forEach(btn => {
  btn.addEventListener('click', function() {
    const serviceName = this.getAttribute('data-service');
    serviceTypeSelect.value = serviceName; // Pre-fill the service type
    openModal();
  });
});

// Close modal when X button is clicked
closeBtn.addEventListener('click', closeModal);

// Close modal when clicking outside the modal content
window.addEventListener('click', function(event) {
  if (event.target === modal) {
    closeModal();
  }
});

// Open modal
function openModal() {
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
  // Initialize calendar when modal opens
  setTimeout(() => {
    renderCalendar();
    renderTimeSlots();
  }, 50);
}

// Close modal
function closeModal() {
  modal.classList.remove('show');
  document.body.style.overflow = 'auto';
  bookingForm.reset();
  bookingMessage.textContent = '';
  bookingMessage.className = '';
  selectedDate = null;
  selectedTime = null;
}

// Calendar Navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    if (this.classList.contains('prev-month')) {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
    } else {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
    }
    renderCalendar();
  });
});

// Render Calendar
function renderCalendar() {
  const monthYear = document.getElementById('monthYear');
  const calendarDays = document.getElementById('calendar');
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  
  monthYear.textContent = `${monthNames[currentMonth]} ${currentYear}`;
  
  // Get first day of month and number of days
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
  
  calendarDays.innerHTML = '';
  
  const today = new Date();
  const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();
  
  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day other-month';
    dayDiv.textContent = daysInPrevMonth - i;
    calendarDays.appendChild(dayDiv);
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day';
    dayDiv.textContent = day;
    
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dateObj = new Date(currentYear, currentMonth, day);
    
    // Disable past dates
    if (dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
      dayDiv.classList.add('disabled');
      dayDiv.style.cursor = 'not-allowed';
    } else {
      dayDiv.addEventListener('click', function() {
        // Remove previous selection
        document.querySelectorAll('.calendar-day.selected').forEach(d => d.classList.remove('selected'));
        dayDiv.classList.add('selected');
        selectedDate = dateStr;
        updateDateDisplay();
        renderTimeSlots();
      });
    }
    
    // Highlight today
    if (isCurrentMonth && day === today.getDate()) {
      dayDiv.classList.add('today');
    }
    
    // Highlight selected date
    if (selectedDate && dateStr === selectedDate) {
      dayDiv.classList.add('selected');
    }
    
    calendarDays.appendChild(dayDiv);
  }
  
  // Next month days
  const totalCells = calendarDays.children.length;
  const remainingCells = 42 - totalCells; // 6 rows * 7 days
  for (let i = 1; i <= remainingCells; i++) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day other-month';
    dayDiv.textContent = i;
    calendarDays.appendChild(dayDiv);
  }
}

// Update date display
function updateDateDisplay() {
  const dateDisplay = document.getElementById('selectedDateDisplay');
  if (selectedDate) {
    const dateObj = new Date(selectedDate + 'T00:00:00');
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    dateDisplay.textContent = dateObj.toLocaleDateString('en-US', options);
  } else {
    dateDisplay.textContent = 'Select a date';
  }
}

// Render Time Slots
function renderTimeSlots() {
  const timeSlotsContainer = document.getElementById('timeSlots');
  timeSlotsContainer.innerHTML = '';
  
  if (!selectedDate) {
    return;
  }
  
  // Get the day of week for the selected date
  const dateObj = new Date(selectedDate + 'T00:00:00');
  const dayOfWeek = dateObj.getDay();
  
  // Get the time slots for this day
  const todaySchedule = daySchedule[dayOfWeek];
  const timeSlots = todaySchedule.slots;
  
  // If closed, show message
  if (timeSlots.length === 0) {
    const closedMsg = document.createElement('div');
    closedMsg.className = 'closed-message';
    closedMsg.textContent = `We're closed on ${todaySchedule.name}s. Please select another day.`;
    timeSlotsContainer.appendChild(closedMsg);
    return;
  }
  
  // Render time slots
  timeSlots.forEach(slot => {
    const slotBtn = document.createElement('button');
    slotBtn.type = 'button';
    slotBtn.className = 'time-slot';
    slotBtn.textContent = slot.display;
    
    if (selectedTime === slot.time) {
      slotBtn.classList.add('selected');
    }
    
    slotBtn.addEventListener('click', function(e) {
      e.preventDefault();
      // Remove previous selection
      document.querySelectorAll('.time-slot.selected').forEach(t => t.classList.remove('selected'));
      slotBtn.classList.add('selected');
      selectedTime = slot.time;
      // Update hidden input
      document.getElementById('serviceTime').value = selectedTime;
    });
    
    timeSlotsContainer.appendChild(slotBtn);
  });
}

// Handle form submission
bookingForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  // Validate date and time are selected
  if (!selectedDate || !selectedTime) {
    showMessage('Please select a date and time', 'error');
    return;
  }

  // Get form data
  const serviceType = document.getElementById('serviceType').value;
  const customerName = document.getElementById('customerName').value;
  const customerEmail = document.getElementById('customerEmail').value;
  const customerPhone = document.getElementById('customerPhone').value;
  const customerStreet = document.getElementById('customerStreet').value;
  const customerCity = document.getElementById('customerCity').value;
  const customerState = document.getElementById('customerState').value;
  const customerZip = document.getElementById('customerZip').value;
  const customerUnit = document.getElementById('customerUnit').value;
  const customerAddress = `${customerStreet}${customerUnit ? ' ' + customerUnit : ''}, ${customerCity}, ${customerState} ${customerZip}`;
  const vehicleYear = document.getElementById('vehicleYear').value;
  const vehicleMake = document.getElementById('vehicleMake').value;
  const vehicleModel = document.getElementById('vehicleModel').value;
  const vehicleTrim = document.getElementById('vehicleTrim').value;
  const vehicleInfo = `${vehicleYear} ${vehicleMake} ${vehicleModel}${vehicleTrim ? ' ' + vehicleTrim : ''}`;
  const notes = document.getElementById('notes').value;

  // Update hidden inputs
  document.getElementById('serviceDate').value = selectedDate;
  document.getElementById('serviceTime').value = selectedTime;

  // Validate date is in the future
  const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
  const now = new Date();
  
  if (selectedDateTime <= now) {
    showMessage('Please select a future date and time', 'error');
    return;
  }

  // Show loading message and disable button
  showMessage('Processing your booking...', 'loading');
  const submitBtn = bookingForm.querySelector('.submit-btn');
  submitBtn.disabled = true;

  try {
    // Send all booking data to the unified endpoint
    const response = await fetch('/api/bookings/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        serviceType,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        serviceDate: selectedDate,
        serviceTime: selectedTime,
        vehicleInfo,
        notes
      })
    });

    if (response.ok) {
      showMessage('✓ Booking confirmed! Check your email for details.', 'success');
      
      // Reset calendar state
      currentMonth = new Date().getMonth();
      currentYear = new Date().getFullYear();
      selectedDate = null;
      selectedTime = null;
      
      // Close modal after 2 seconds
      setTimeout(() => {
        closeModal();
        submitBtn.disabled = false;
      }, 2000);
    } else {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create booking');
    }
  } catch (error) {
    console.error('Booking error:', error);
    showMessage('Error processing booking. Please try again.', 'error');
    submitBtn.disabled = false;
  }
});

// Show message to user
function showMessage(message, type) {
  bookingMessage.textContent = message;
  bookingMessage.className = type;
}

console.log('Booking system loaded successfully');

