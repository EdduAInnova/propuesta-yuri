// modal-agendamiento.js - Sistema centralizado de agendamiento

// Abrir modal
function openAppointmentModal(planName) {
    const modal = document.getElementById('appointmentModal');
    const planInput = document.getElementById('selectedPlan');
    const planDisplay = document.getElementById('planDisplay');
    
    if (modal && planInput && planDisplay) {
        planInput.value = planName || 'Consulta General';
        planDisplay.value = planName || 'Consulta General';
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        // FIX: Bloquear scroll del body para evitar doble scroll
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
    }
}

// Cerrar modal
function closeAppointmentModal() {
    const modal = document.getElementById('appointmentModal');
    
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        
        // FIX: Restaurar scroll del body
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        
        const form = document.getElementById('appointmentForm');
        if (form) form.reset();
        
        const timeSlots = document.getElementById('timeSlots');
        if (timeSlots) timeSlots.classList.add('hidden');
    }
}

// Initialize cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initializeFlatpickr();
    initializeFormValidation();
    initializeFormSubmission();
});

// Inicializar Flatpickr
let picker = null;
function initializeFlatpickr() {
    const now = new Date();
    const minDate = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    
    const isMobile = window.innerWidth < 768;
    
    picker = flatpickr("#datePicker", {
        locale: "es",
        minDate: minDate,
        dateFormat: "Y-m-d",
        disableMobile: true, // CRITICAL: Force Flatpickr UI, disable native picker
        static: isMobile, // Use static positioning on mobile to avoid calculation errors
        position: isMobile ? "auto center" : "auto center",
        appendTo: undefined, // Let Flatpickr handle appending (usually after input)
        inline: false,
        disable: [
            function(date) {
                return date.getDay() === 0;
            }
        ],
        onChange: function(selectedDates, dateStr) {
            if (selectedDates.length > 0) {
                document.getElementById('selectedDate').value = dateStr;
                generateTimeSlots(selectedDates[0]);
            }
        }
    });
}

// Generar slots de tiempo
function generateTimeSlots(selectedDate) {
    const timeSlotsDiv = document.getElementById('timeSlots');
    const gridDiv = document.getElementById('timeSlotsGrid');
    gridDiv.innerHTML = '';
    
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();
    const minHoursFromNow = 6;
    
    // DENTRO de generateTimeSlots(), reemplazar el loop de minutes:
    const interval = window.innerWidth < 768 ? 30 : 15; // FIX: 30min en mobile
    
    for (let hour = 9; hour <= 19; hour++) {
        for (let minute = 0; minute < 60; minute += interval) { // USA interval variable
            const slotDate = new Date(selectedDate);
            slotDate.setHours(hour, minute, 0, 0);
            
            if (isToday) {
                const hoursFromNow = (slotDate - now) / (1000 * 60 * 60);
                if (hoursFromNow < minHoursFromNow) continue;
            }
            
            if (hour === 19 && minute > 0) break;
            
            let displayHour = hour > 12 ? hour - 12 : hour;
            if (displayHour === 0) displayHour = 12;
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const timeStr = `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
            
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'time-slot px-2 sm:px-3 py-2.5 bg-slate-800 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500 rounded-lg text-xs sm:text-sm transition min-h-[44px] flex items-center justify-center';
            button.textContent = timeStr;
            button.onclick = () => selectTimeSlot(timeStr, button);
            
            gridDiv.appendChild(button);
        }
    }
    
    timeSlotsDiv.classList.remove('hidden');
}

// Seleccionar slot de tiempo
function selectTimeSlot(time, button) {
    // Remove selection from all slots
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('bg-cyan-500', 'border-cyan-500', 'text-white');
        slot.classList.add('bg-slate-800', 'border-white/10');
    });
    
    // Add selection to clicked slot
    button.classList.remove('bg-slate-800', 'border-white/10');
    button.classList.add('bg-cyan-500', 'border-cyan-500', 'text-white');
    
    document.getElementById('selectedTime').value = time;
    validateForm();
}

// Validar formulario
function validateForm() {
    const form = document.getElementById('appointmentForm');
    const submitBtn = document.getElementById('submitBtn');
    
    if (!form || !submitBtn) return;
    
    const nombre = form.nombre?.value;
    const email = form.email?.value;
    const telefono = form.telefono?.value;
    const fecha = document.getElementById('selectedDate').value;
    const hora = document.getElementById('selectedTime').value;
    const tipo = document.getElementById('selectedMeetingType').value;
    const checkboxes = form.querySelectorAll('input[type="checkbox"]:required');
    const allCheckboxesChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    const isValid = nombre && email && telefono && fecha && hora && tipo && allCheckboxesChecked;
    
    submitBtn.disabled = !isValid;
}

// Inicializar validación del formulario
function initializeFormValidation() {
    // Handle meeting type selection
    document.querySelectorAll('input[name="tipoReunion"]').forEach(radio => {
        radio.addEventListener('change', function() {
            document.getElementById('selectedMeetingType').value = this.value;
            validateForm();
        });
    });
    
    // Validate form on any change
    const form = document.getElementById('appointmentForm');
    if (form) {
        form.addEventListener('change', validateForm);
        form.addEventListener('input', validateForm);
    }
}

// Inicializar envío del formulario
function initializeFormSubmission() {
    const form = document.getElementById('appointmentForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        // Add meeting details
        const fecha = document.getElementById('selectedDate').value;
        const hora = document.getElementById('selectedTime').value;
        const tipo = document.getElementById('selectedMeetingType').value;
        
        // 1. Send to Formspree
        try {
            await fetch('https://formspree.io/f/xqavawbb', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            // 2. Send WhatsApp notification via CallMeBot
            const whatsappMessage = `📅 *Nueva Reunión Agendada*\n\n` +
                `*Plan:* ${data.plan}\n` +
                `*Nombre:* ${data.nombre}\n` +
                `*Empresa:* ${data.empresa || 'No especificada'}\n` +
                `*Email:* ${data.email}\n` +
                `*WhatsApp:* ${data.telefono}\n\n` +
                `*📅 Fecha:* ${fecha}\n` +
                `*🕐 Hora:* ${hora}\n` +
                `*📞 Tipo:* ${tipo === 'llamada' ? 'Llamada telefónica' : 'Videollamada'}\n\n` +
                `*Mensaje:* ${data.mensaje || 'Sin mensaje adicional'}`;
            
            const encodedMessage = encodeURIComponent(whatsappMessage);
            const whatsappURL = `https://api.callmebot.com/whatsapp.php?phone=573185462265&text=${encodedMessage}&apikey=9482148`;
            
            const img = new Image();
            img.src = whatsappURL;
            
            // Redirect to confirmation page with parameters
            const params = new URLSearchParams({
                nombre: data.nombre,
                fecha: fecha,
                hora: hora,
                tipo: tipo
            });
            window.location.href = `confirmacion.html?${params.toString()}`;
            
        } catch (error) {
            console.error('Error:', error);
            alert('Hubo un error al agendar. Por favor intenta nuevamente.');
        }
    });
}
