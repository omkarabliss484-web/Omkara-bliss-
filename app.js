"use strict";

const SUPABASE_URL =
  "https://obdctgheiqvrqxbxpgcg.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_2OKWMkcHpYltlhvV-kA1UQ_Bbrf4Xx9";

let db = null;


// ===============================
// SUPABASE
// ===============================

function initSupabase() {
  if (
    window.supabase &&
    typeof window.supabase.createClient === "function"
  ) {
    db = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );

    console.log("Supabase connected");
  }
}


// ===============================
// LOADER
// ===============================

function initLoader() {
  const loader = document.getElementById("loader");

  if (!loader) return;

  setTimeout(() => {
    loader.classList.add("hidden");
    loader.style.display = "none";
  }, 800);
}


// ===============================
// MOBILE MENU
// ===============================

function initMenu() {

  const menu = document.getElementById("menuToggle");
  const nav = document.getElementById("navLinks");

  if (!menu || !nav) return;

  menu.onclick = function () {
    nav.classList.toggle("active");
  };

  nav.querySelectorAll("a").forEach(link => {

    link.onclick = function () {
      nav.classList.remove("active");
    };

  });
}


// ===============================
// BOOKING NAVIGATION
// ===============================

function goToBooking() {

  const booking =
    document.getElementById("booking");

  if (!booking) {
    console.error("Booking section not found");
    return;
  }

  booking.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}


// ===============================
// ALL BOOKING BUTTONS
// ===============================

function initBookingButtons() {

  document.querySelectorAll(
    'a[href="#booking"]'
  ).forEach(button => {

    button.onclick = function (event) {

      event.preventDefault();

      goToBooking();

    };

  });


  document.querySelectorAll(
    ".room-book-btn"
  ).forEach(button => {

    button.onclick = function () {

      const room =
        button.getAttribute("data-room");

      const roomSelect =
        document.getElementById("roomType");

      if (roomSelect && room) {
        roomSelect.value = room;
      }

      goToBooking();

    };

  });

}


// ===============================
// DATE SETUP
// ===============================

function initDates() {

  const checkin =
    document.getElementById("checkin");

  const checkout =
    document.getElementById("checkout");

  if (!checkin || !checkout) return;

  const today =
    new Date().toISOString().split("T")[0];

  checkin.min = today;
  checkout.min = today;

  checkin.onchange = function () {

    checkout.min = checkin.value;

  };

}


// ===============================
// POPUP
// ===============================

function openPopup(message) {

  const popup =
    document.getElementById("bookingPopup");

  const text =
    document.getElementById("popupText");

  if (!popup || !text) return;

  text.innerHTML = message;

  popup.style.display = "flex";

  popup.classList.add("show");

}


function closePopup() {

  const popup =
    document.getElementById("bookingPopup");

  if (!popup) return;

  popup.style.display = "none";

  popup.classList.remove("show");

}


function initPopup() {

  const close =
    document.getElementById("popupClose");

  const done =
    document.getElementById("popupDone");

  if (close) {
    close.onclick = closePopup;
  }

  if (done) {
    done.onclick = closePopup;
  }

}


// ===============================
// BOOKING SUBMIT
// ===============================

function initBookingForm() {

  const form =
    document.getElementById("bookingForm");

  if (!form) {
    console.error("Booking form not found");
    return;
  }


  form.onsubmit = async function (event) {

    event.preventDefault();


    const button =
      document.getElementById("bookingSubmit");


    const name =
      document.getElementById("guestName").value.trim();

    const mobile =
      document.getElementById("mobile").value.trim();

    const checkin =
      document.getElementById("checkin").value;

    const checkout =
      document.getElementById("checkout").value;

    const guests =
      document.getElementById("guests").value;

    const room =
      document.getElementById("roomType").value;


    if (!name) {
      alert("Please enter guest name.");
      return;
    }

    if (!mobile) {
      alert("Please enter mobile number.");
      return;
    }

    if (!checkin) {
      alert("Please select check-in date.");
      return;
    }

    if (!checkout) {
      alert("Please select check-out date.");
      return;
    }

    if (checkout <= checkin) {
      alert(
        "Check-out date must be after check-in date."
      );
      return;
    }

    if (!guests) {
      alert("Please select guests.");
      return;
    }

    if (!room) {
      alert("Please select room type.");
      return;
    }


    const bookingId =
      "HB-" +
      Math.floor(
        100000 +
        Math.random() * 900000
      );


    const booking = {

      booking_id: bookingId,

      guest_name: name,

      mobile: mobile,

      checkin: checkin,

      checkout: checkout,

      guests: Number(guests),

      room_type: room,

      status: "pending"

    };


    if (button) {

      button.disabled = true;

      button.innerText =
        "Sending Request...";

    }


    try {

      if (!db) {
        initSupabase();
      }

      if (!db) {
        throw new Error(
          "Supabase could not be loaded."
        );
      }


      const result =
        await db
          .from("bookings")
          .insert([booking]);


      if (result.error) {

        console.error(
          "Supabase error:",
          result.error
        );

        throw new Error(
          result.error.message
        );

      }


      // Local backup

      const saved =
        JSON.parse(
          localStorage.getItem(
            "omkaraBookings"
          ) || "[]"
        );

      saved.push(booking);

      localStorage.setItem(
        "omkaraBookings",
        JSON.stringify(saved)
      );


      openPopup(`

        <h2>Booking Request Sent</h2>

        <p>
          Thank you, ${name}.
        </p>

        <p>
          Your booking request has been received.
        </p>

        <p>
          <strong>Booking ID</strong>
        </p>

        <h3>
          ${bookingId}
        </h3>

        <p>
          <strong>Status:</strong>
          Pending Confirmation
        </p>

      `);


      form.reset();


    } catch (error) {

      console.error(
        "Booking failed:",
        error
      );


      openPopup(`

        <h2>Booking Request Failed</h2>

        <p>
          ${error.message}
        </p>

      `);


    } finally {

      if (button) {

        button.disabled = false;

        button.innerText =
          "Send Booking Request";

      }

    }

  };

}


// ===============================
// START
// ===============================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    initSupabase();

    initLoader();

    initMenu();

    initBookingButtons();

    initDates();

    initPopup();

    initBookingForm();

    console.log(
      "Hotel Omkara Bliss loaded successfully"
    );

  }
);