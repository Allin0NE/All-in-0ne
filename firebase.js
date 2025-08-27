<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyDumL-K0SykfwqUIoG3Jn0M6j_xsw4OEYI",
    authDomain: "all-in-one-a082a.firebaseapp.com",
    projectId: "all-in-one-a082a",
    storageBucket: "all-in-one-a082a.firebasestorage.app",
    messagingSenderId: "960883127275",
    appId: "1:960883127275:web:0d90e14b9ab6a225d75fae",
    measurementId: "G-2KX3ME9Y7G"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>
