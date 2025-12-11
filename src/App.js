import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Button,
  Box,
  Divider,
  Alert,
  CircularProgress,
  Grid,
  Dialog,
  DialogContent,
  Zoom,
} from '@mui/material';
import { ThemeProvider, createTheme, rtl } from '@mui/material/styles';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SignatureCanvas from 'react-signature-canvas';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { keyframes } from '@emotion/react';


const globalTheme = createTheme({
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          height: '60px !important',       // גובה אחיד לכל השדות
          alignItems: 'center',
        },
        input: {
          padding: '14px !important',      // מרווח אחיד
          lineHeight: '1.4 !important',
        },
      },
    },
  },
});

// Animations
const dropIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-100px);
  }
  60% {
    opacity: 1;
    transform: translateY(20px);
  }
  80% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0);
  }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

function App() {
  const signatureRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showDevTools, setShowDevTools] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSuccess(false);
    setFormData({
      clientName: '',
      birthDate: '',
      phone: '',
      email: '',
      pregnant: '',
      pregnantDetails: '',
      skinCondition: {
        dry: false,
        oily: false,
        sensitive: false,
        normal: false,
        combination: false,
      },
      skinIssues: {
        acne: false,
        pigmentation: false,
        rosacea: false,
      },
      previousTreatments: '',
      previousTreatmentWhere: '',
      previousTreatmentTypes: '',
      medications: '',
      allergies: '',
      chronicDiseases: '',
      heartDisease: '',
      heartDiseaseDetails: '',
      bloodPressure: '',
      bloodPressureDetails: '',
      diabetes: '',
      diabetesDetails: '',
      epilepsy: '',
      epilepsyDetails: '',
      cancer: '',
      cancerDetails: '',
      hiv: '',
      hivDetails: '',
      bloodThinner: '',
      consentAgreement: false,
      signatureDate: '',
    });
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setShowDevTools(true);
    }
  }, []);

  const [formData, setFormData] = useState({
    // פרטים אישיים
    clientName: '',
    birthDate: '',
    phone: '',
    email: '',
    
    // מידע רפואי
    pregnant: '',
    pregnantDetails: '',
    
    // מצב העור
    skinCondition: {
      dry: false,
      oily: false,
      sensitive: false,
      normal: false,
      combination: false,
    },
    skinIssues: {
      acne: false,
      pigmentation: false,
      rosacea: false,
    },
    
    // טיפולים קוסמטיים
    previousTreatments: '',
    previousTreatmentWhere: '',
    previousTreatmentTypes: '',
    
    // תרופות ואלרגיות
    medications: '',
    allergies: '',
    chronicDiseases: '',
    
    // מידע בריאותי
    heartDisease: '',
    heartDiseaseDetails: '',
    bloodPressure: '',
    bloodPressureDetails: '',
    diabetes: '',
    diabetesDetails: '',
    epilepsy: '',
    epilepsyDetails: '',
    cancer: '',
    cancerDetails: '',
    hiv: '',
    hivDetails: '',
    bloodThinner: '',
    
    // הסכמה
    consentAgreement: false,
    signatureDate: '',
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox' && name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const clearSignature = () => {
    signatureRef.current.clear();
  };

  const fillTestData = () => {
    setFormData({
      clientName: 'מזל מועלם',
      birthDate: '1990-01-01',
      phone: '0500000000',
      email: 'test@example.com',
      pregnant: 'no',
      pregnantDetails: '',
      skinCondition: {
        dry: true,
        oily: false,
        sensitive: false,
        normal: false,
        combination: false,
      },
      skinIssues: {
        acne: true,
        pigmentation: false,
        rosacea: false,
      },
      previousTreatments: 'טיפול פנים בסיסי לפני שנה',
      previousTreatmentWhere: 'קליניקה בתל אביב, 2024',
      previousTreatmentTypes: 'פילינג עדין',
      medications: 'גלולות למניעת הריון',
      allergies: 'ללא',
      chronicDiseases: 'ללא',
      heartDisease: 'no',
      heartDiseaseDetails: 'מעשנת ים אבל',
      bloodPressure: 'no',
      bloodPressureDetails: '',
      diabetes: 'no',
      diabetesDetails: '',
      epilepsy: '',
      epilepsyDetails: '',
      cancer: '',
      cancerDetails: '',
      hiv: '',
      hivDetails: '',
      bloodThinner: 'ללא',
      consentAgreement: true,
      signatureDate: new Date().toISOString().split('T')[0],
    });
  };

  const generatePDF = async () => {
    const originalScrollPos = window.scrollY;
    
    // 1. Create a clone
    const formElement = document.getElementById('form-container');
    const clone = formElement.cloneNode(true);

/* -------------------------------
   PDF FORM STYLE FIX (CLEAN & SHORT)
----------------------------------- */

// Global direction
clone.style.direction = "rtl";
clone.style.textAlign = "right";

// Apply RTL to everything
clone.querySelectorAll("*").forEach(el => {
  el.style.direction = "rtl";
  el.style.textAlign = "right";
});

/* --- Stable & Proper Label Positioning (Adjusted Version) --- */
clone.querySelectorAll(".MuiFormControl-root").forEach(control => {
  const label = control.querySelector(".MuiInputLabel-root");
  const wrapper = control.querySelector(".MuiOutlinedInput-root");

  if (label && wrapper) {
    label.style.position = "absolute";
    label.style.top = "-4px";      // was -6px → FIX for page 2
    label.style.right = "12px";
    label.style.background = "white";
    label.style.padding = "0 4px";
    label.style.fontSize = "0.83rem";
    label.style.fontWeight = "500";
    label.style.zIndex = "5";
    label.style.lineHeight = "1";
    label.style.transform = "none";
  }

  if (wrapper) {
    wrapper.style.position = "relative";
  }
});

/* --- Fix Section Titles (h6) spacing to avoid label collision --- */
clone.querySelectorAll("h6").forEach(title => {
  title.style.fontSize = "18px";
  title.style.fontWeight = "700";
  title.style.marginTop = "35px";
  title.style.marginBottom = "20px"; // was 10px → fixed to avoid label overlap
  title.style.color = "#db3c78";
});

/* --- REMOVE HEIGHT INCREASES (important!) --- */
clone.querySelectorAll(".MuiOutlinedInput-root").forEach(box => {
  box.style.paddingTop = "8px";     // במקום 18px — FIX
  box.style.minHeight = "60px";    // גובה קבוע ואחיד בכל הדפים
  box.style.display = "flex";
  box.style.alignItems = "center";
});


/* --- Fix Section Titles (keep clean) --- */
clone.querySelectorAll("h6").forEach(title => {
  title.style.fontSize = "18px";
  title.style.fontWeight = "700";
  title.style.marginTop = "25px";
  title.style.marginBottom = "10px";
  title.style.color = "#db3c78";
});

/* --- Divider spacing (small, not too big) --- */
clone.querySelectorAll("hr").forEach(div => {
  div.style.margin = "20px 0";
});

/* --- Inputs text style --- */
clone.querySelectorAll("input, textarea").forEach(input => {
  input.style.fontSize = "15px";
  input.style.fontWeight = "500";
});

    // 2. Initial Style Setup for Clone
    // We set a fixed width (~A4 ratio) to ensure consistency
    const a4WidthPx = 794; // approx 210mm at 96dpi
    clone.style.width = `${a4WidthPx}px`;
    clone.style.position = 'absolute';
    clone.style.top = '-10000px'; // Hide it way off screen
    clone.style.left = '0px';
    clone.style.zIndex = '-9999';
    clone.style.animation = 'none';
    clone.style.transform = 'none';
    clone.style.margin = '0';
    clone.style.padding = '40px'; 
    clone.style.background = '#ffffff';
    clone.style.height = 'auto'; // Let it grow
    clone.style.overflow = 'visible';

    // Copy input values
    const originalInputs = formElement.querySelectorAll('input, textarea');
    const clonedInputs = clone.querySelectorAll('input, textarea');
    originalInputs.forEach((input, index) => {
      if (clonedInputs[index]) {
        clonedInputs[index].value = input.value;
        if (input.type === 'checkbox' || input.type === 'radio') {
             clonedInputs[index].checked = input.checked;
        }
      }
    });

    // Copy canvas (signature)
    const originalCanvases = formElement.querySelectorAll('canvas');
    const clonedCanvases = clone.querySelectorAll('canvas');
    originalCanvases.forEach((canvas, index) => {
      if (clonedCanvases[index]) {
        const ctx = clonedCanvases[index].getContext('2d');
        ctx.drawImage(canvas, 0, 0);
      }
    });

    document.body.appendChild(clone);
    
  
    // 3. Smart Page Breaks Logic — prevents splitting of section titles

    const PAGE_HEIGHT = 1120;
    let currentHeight = 0;

    const formChild = clone.querySelector("form");
    if (formChild) {
      const children = Array.from(formChild.children);

      for (let i = 0; i < children.length; i++) {
        const child = children[i];

        const style = window.getComputedStyle(child);
        const marginTop = parseInt(style.marginTop) || 0;
        const marginBottom = parseInt(style.marginBottom) || 0;
        const childHeight = child.offsetHeight + marginTop + marginBottom;

        // Detect section titles <h6> created by MUI Typography variant="h6"
        const isTitle =
          child.tagName === "H6" ||
          child.querySelector("h6") ||
          child.getAttribute("data-section-title") === "true";

        if (isTitle) {
          // Ensure title is always together with at least the next block
          const next = children[i + 1];
          const nextHeight = (next?.offsetHeight || 250) + 60;
          const required = childHeight + nextHeight;

          if (currentHeight + required > PAGE_HEIGHT) {
            const spaceRemaining = PAGE_HEIGHT - currentHeight;

            const spacer = document.createElement("div");
            spacer.style.height = `${spaceRemaining + 20}px`;
            spacer.style.width = "100%";
            spacer.style.display = "block";

            formChild.insertBefore(spacer, child);
            currentHeight = 0;
          }
        }

        // Normal breaker
        if (currentHeight + childHeight > PAGE_HEIGHT) {
          const spaceRemaining = PAGE_HEIGHT - currentHeight;

          const spacer = document.createElement("div");
          spacer.style.height = `${spaceRemaining + 20}px`;
          spacer.style.width = "100%";
          spacer.style.display = "block";

          formChild.insertBefore(spacer, child);
          currentHeight = childHeight;
        } else {
          currentHeight += childHeight;
        }
      }
    }

    // Scroll to top to help html2canvas render correctly
    window.scrollTo(0, 0);

    
    let pdf;

    try {
      const canvas = await html2canvas(clone, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        // We let the width/height be determined by the content which we just adjusted
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfPageWidth = 210;
      const pdfPageHeight = 297;
      
      // Calculate dimensions in PDF
      const imgWidth = pdfPageWidth; 
      const imgHeight = (canvas.height * pdfPageWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      let pageIndex = 0;

      // Add first page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfPageHeight;

      // Add subsequent pages
      while (heightLeft > 0) {
        position -= pdfPageHeight; // Move the image up by one page height
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfPageHeight;
      }
      
    } catch (err) {
      console.error("PDF Generation failed", err);
      throw err;
    } finally {
      document.body.removeChild(clone);
      window.scrollTo(0, originalScrollPos);
    }
    
    return pdf;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.consentAgreement) {
      setError('יש לאשר את תנאי ההסכמה');
      return;
    }
    
    if (signatureRef.current.isEmpty()) {
      setError('יש לחתום על הטופס');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Generate PDF
      const pdf = await generatePDF();
      const pdfBase64 = pdf.output('datauristring').split(',')[1];
      
      // Send email using EmailJS
      // You need to replace these with your actual EmailJS credentials
      const templateParams = {
        client_name: formData.clientName,
        client_email: formData.email,
        client_phone: formData.phone,
        pdf_attachment: pdfBase64,
      };
      console.log('client_name', formData.clientName);
      console.log('client_email', formData.email);
      console.log('client_phone', formData.phone);

      // שליחה לשרת ה-PHP שלנו
      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/send-email.php';
      console.log('apiUrl',apiUrl);
       
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateParams),
      });
      console.log("Sending to:", apiUrl, templateParams);

      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'שליחת המייל נכשלה');
      }
      
      setSuccess(true);
      setLoading(false);
      setOpenDialog(true);
      
    } catch (err) {
      console.error('Error:', err);
      setError('אירעה שגיאה בשליחת הטופס. אנא נסה שוב.');
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        mb: 5,
        animation: `${dropIn} 1s ease-out`
      }}>
        <img 
          src="/Web_Photo_Editor.jpg" 
          alt="SKINCARE SALON" 
          style={{ 
            maxHeight: '250px',
            borderRadius: '20px',

          }} 
        />
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            fontWeight: 'bold', 
            color: '#424242',
            textAlign: 'center',
            mb: 1,
            marginTop: '-2.5rem'
          }}
        >
          טופס בריאות
        </Typography>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            color: '#757575',
            textAlign: 'center',

          }}
        >
          אנא מלאו את הפרטים הבאים לפני הטיפול
        </Typography>
      </Box>

      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 3, md: 5 }, 
          backgroundColor: '#ffeeee', // White paper for better contrast on pink bg
          borderRadius: 4,
          boxShadow: '0 10px 40px rgba(233, 30, 99, 0.08)',
          animation: `${fadeInUp} 0.8s ease-out 0.4s both`, // Delay execution
          border: '1px solid rgba(244, 143, 177, 0.1)'
        }} 
        id="form-container"
      >
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            הטופס נשלח בהצלחה! תודה רבה.
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {showDevTools && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
            <Button variant="outlined" size="small" onClick={fillTestData}>
              מילוי אוטומטי (בדיקות)
            </Button>
          </Box>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* פרטים אישיים */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom color="secondary">
              פרטים אישיים
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="שם הלקוחה"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="תאריך לידה"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="טלפון"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="תאריך מילוי הטופס"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* מידע רפואי */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom color="secondary">
              מידע רפואי 🌸
            </Typography>
            
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel>האם את בהריון או מניקה?</FormLabel>
              <RadioGroup
                name="pregnant"
                value={formData.pregnant}
                onChange={handleInputChange}
                row
              >
                <FormControlLabel value="yes" control={<Radio />} label="כן" />
                <FormControlLabel value="no" control={<Radio />} label="לא" />
              </RadioGroup>
            </FormControl>
            
            {formData.pregnant === 'yes' && (
              <TextField
                fullWidth
                label="פרטים נוספים"
                name="pregnantDetails"
                value={formData.pregnantDetails}
                onChange={handleInputChange}
                multiline
                rows={2}
                sx={{ mb: 2 }}
              />
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* מצב העור */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom color="secondary">
              מצב העור 🌸
            </Typography>
            
            <FormControl component="fieldset">
              <FormLabel>איך היית מגדירה את סוג העור שלך?</FormLabel>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="skinCondition.dry"
                      checked={formData.skinCondition.dry}
                      onChange={handleInputChange}
                    />
                  }
                  label="יבש"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="skinCondition.oily"
                      checked={formData.skinCondition.oily}
                      onChange={handleInputChange}
                    />
                  }
                  label="שמן"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="skinCondition.sensitive"
                      checked={formData.skinCondition.sensitive}
                      onChange={handleInputChange}
                    />
                  }
                  label="רגיש"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="skinCondition.normal"
                      checked={formData.skinCondition.normal}
                      onChange={handleInputChange}
                    />
                  }
                  label="נורמלי"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="skinCondition.combination"
                      checked={formData.skinCondition.combination}
                      onChange={handleInputChange}
                    />
                  }
                  label="מעורב"
                />
              </Box>
            </FormControl>
            
            <FormControl component="fieldset" sx={{ mt: 3 }}>
              <FormLabel>בעיות עור קיימות</FormLabel>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="skinIssues.acne"
                      checked={formData.skinIssues.acne}
                      onChange={handleInputChange}
                    />
                  }
                  label="אקנה"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="skinIssues.pigmentation"
                      checked={formData.skinIssues.pigmentation}
                      onChange={handleInputChange}
                    />
                  }
                  label="פיגמנטציה"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="skinIssues.rosacea"
                      checked={formData.skinIssues.rosacea}
                      onChange={handleInputChange}
                    />
                  }
                  label="רוזציאה"
                />
              </Box>
            </FormControl>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* טיפולים קוסמטיים */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom color="secondary">
              טיפולים קוסמטיים 🌸
            </Typography>
            
            <TextField
              fullWidth
              label="האם עברת טיפולי פנים בעבר?"
              name="previousTreatments"
              value={formData.previousTreatments}
              onChange={handleInputChange}

              rows={2}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="איפה ומתי?"
              name="previousTreatmentWhere"
              value={formData.previousTreatmentWhere}
              onChange={handleInputChange}

              rows={2}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="סוגי טיפולים (פילינג, לייזר, בוטוקס, מילוי)"
              name="previousTreatmentTypes"
              value={formData.previousTreatmentTypes}
              onChange={handleInputChange}

              rows={2}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* מידע בריאותי */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom color="secondary">
              מידע בריאותי 🌸
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="תרופות קבועות"
                  name="medications"
                  value={formData.medications}
                  onChange={handleInputChange}

                  rows={2}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="אלרגיות (תרופות, מזון, חומרים)"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleInputChange}

                  rows={2}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="מחלות כרוניות"
                  name="chronicDiseases"
                  value={formData.chronicDiseases}
                  onChange={handleInputChange}

                  rows={2}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel>האם יש לך מחלות לב?</FormLabel>
                  <RadioGroup
                    name="heartDisease"
                    value={formData.heartDisease}
                    onChange={handleInputChange}
                    row
                  >
                    <FormControlLabel value="yes" control={<Radio />} label="כן" />
                    <FormControlLabel value="no" control={<Radio />} label="לא" />
                  </RadioGroup>
                </FormControl>
                {formData.heartDisease === 'yes' && (
                  <TextField
                    fullWidth
                    label="פרטים"
                    name="heartDiseaseDetails"
                    value={formData.heartDiseaseDetails}
                    onChange={handleInputChange}
                    sx={{ mt: 1 }}
                  />
                )}
              </Grid>
              
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel>לחץ דם גבוה או נמוך?</FormLabel>
                  <RadioGroup
                    name="bloodPressure"
                    value={formData.bloodPressure}
                    onChange={handleInputChange}
                    row
                  >
                    <FormControlLabel value="yes" control={<Radio />} label="כן" />
                    <FormControlLabel value="no" control={<Radio />} label="לא" />
                  </RadioGroup>
                </FormControl>
                {formData.bloodPressure === 'yes' && (
                  <TextField
                    fullWidth
                    label="פרטים"
                    name="bloodPressureDetails"
                    value={formData.bloodPressureDetails}
                    onChange={handleInputChange}
                    sx={{ mt: 1 }}
                  />
                )}
              </Grid>
              
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel>סוכרת?</FormLabel>
                  <RadioGroup
                    name="diabetes"
                    value={formData.diabetes}
                    onChange={handleInputChange}
                    row
                  >
                    <FormControlLabel value="yes" control={<Radio />} label="כן" />
                    <FormControlLabel value="no" control={<Radio />} label="לא" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="תרופות מדללות דם"
                  name="bloodThinner"
                  value={formData.bloodThinner}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* חתימה דיגיטלית */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom color="secondary">
              הסכמה וחתימה 🌸
            </Typography>
            
            <FormControlLabel
              control={
                <Checkbox
                  name="consentAgreement"
                  checked={formData.consentAgreement}
                  onChange={handleInputChange}
                  required
                />
              }
              label="אני מאשרת כי קראתי והבנתי את כל הפרטים בטופס זה ומסכימה לטיפול"
              sx={{ mb: 2 }}
            />
            
            <Typography variant="body2" gutterBottom>
              חתימה דיגיטלית:
            </Typography>
            
            <Box
              sx={{
                border: '2px solid',
                borderColor: 'primary.main',
                borderRadius: 1,
                mb: 2,
                backgroundColor: 'white',
              }}
            >
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  style: {
                    width: '100%',
                    height: '200px',
                  },
                }}
              />
            </Box>
            
            <Button
              variant="outlined"
              onClick={clearSignature}
              sx={{ mb: 2 }}
            >
              נקה חתימה
            </Button>
            
            <TextField
              fullWidth
              label="תאריך"
              name="signatureDate"
              type="date"
              value={formData.signatureDate}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                minWidth: 200,
                py: 1.5,
                fontSize: '1.1rem',
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'שלח טופס'}
            </Button>
          </Box>
        </form>
      </Paper>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        TransitionComponent={Zoom}
        keepMounted
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: 2,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #fff 0%, #fff0f5 100%)',
          }
        }}
      >
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 4, pb: 4 }}>
          <CheckCircleOutlineIcon 
            sx={{ 
              fontSize: 80, 
              color: '#4caf50', 
              mb: 2, 
              animation: `${dropIn} 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)` 
            }} 
          />
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
            תודה רבה!
          </Typography>
          <Typography variant="h6" sx={{ color: '#666', mb: 3 }}>
            הטופס נשלח בהצלחה
          </Typography>
          <Button 
            variant="contained" 
            onClick={handleCloseDialog}
            size="large"
            sx={{ 
              borderRadius: 50, 
              px: 4, 
              py: 1,
              fontSize: '1.2rem',
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
              textTransform: 'none'
            }}
          >
            סגירה
          </Button>
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default App;
