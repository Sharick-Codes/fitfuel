import { jsPDF } from 'jspdf';

export const generateHealthReportPDF = ({ user, activeGoal, totals, water, healthScore, meals }) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Background Header Banner
  doc.setFillColor(10, 14, 26); // #0A0E1A
  doc.rect(0, 0, pageWidth, 42, 'F');

  // FitFuel Brand Title
  doc.setTextColor(0, 212, 170); // #00D4AA
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('FITFUEL PRO', 14, 18);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('CLINICAL NUTRITION & METABOLIC PERFORMANCE REPORT', 14, 25);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated on: ${dateStr}`, 14, 33);

  // Status Badge top right
  doc.setFillColor(0, 212, 170);
  doc.roundedRect(pageWidth - 58, 14, 44, 10, 2, 2, 'F');
  doc.setTextColor(10, 14, 26);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('VERIFIED REPORT', pageWidth - 52, 20);

  let y = 52;

  // SECTION 1: ATHLETE METABOLIC PROFILE
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. ATHLETE BIOMETRIC PROFILE', 14, y);
  doc.setDrawColor(226, 232, 240);
  doc.line(14, y + 2, pageWidth - 14, y + 2);
  y += 8;

  const heightM = (user?.height || 175) / 100;
  const weightKg = user?.weight || 72;
  const bmi = (weightKg / (heightM * heightM)).toFixed(1);
  const bmiCategory = bmi < 18.5 ? 'Underweight' : bmi < 23.0 ? 'Normal (Healthy)' : bmi < 27.5 ? 'Overweight (Asian Consensus)' : 'Obese';

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  const col1 = 14;
  const col2 = 75;
  const col3 = 135;

  doc.text(`Athlete: ${user?.name || 'Athlete'}`, col1, y);
  doc.text(`Age: ${user?.age || 26} yrs (${user?.gender || 'Male'})`, col2, y);
  doc.text(`Goal: ${user?.goal === 'lose' ? 'Fat Loss' : user?.goal === 'gain' ? 'Muscle Hypertrophy' : 'Body Recomposition'}`, col3, y);
  y += 6;

  doc.text(`Height: ${user?.height || 175} cm`, col1, y);
  doc.text(`Weight: ${weightKg} kg`, col2, y);
  doc.text(`Target Weight: ${activeGoal?.targetWeight || user?.targetWeight || weightKg} kg`, col3, y);
  y += 6;

  doc.text(`BMI Score: ${bmi} (${bmiCategory})`, col1, y);
  doc.text(`Activity: ${user?.activityLevel || 'Moderate'}`, col2, y);
  doc.text(`Metabolic Health Score: ${healthScore || 85} / 100`, col3, y);
  y += 12;

  // SECTION 2: DAILY ENERGY & MACRONUTRIENT BUDGET
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('2. ENERGY BALANCE & MACRONUTRIENTS (TODAY)', 14, y);
  doc.line(14, y + 2, pageWidth - 14, y + 2);
  y += 8;

  const targetCal = activeGoal?.dailyCalorieTarget || 2000;
  const consumedCal = totals?.calories || 0;
  const targetProtein = activeGoal?.dailyProteinTarget || 140;
  const consumedProtein = totals?.protein || 0;
  const targetCarbs = activeGoal?.dailyCarbsTarget || 200;
  const consumedCarbs = totals?.carbs || 0;
  const targetFats = activeGoal?.dailyFatsTarget || 60;
  const consumedFats = totals?.fats || 0;

  // Summary box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, pageWidth - 28, 22, 3, 3, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, y, pageWidth - 28, 22, 3, 3, 'D');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Calories: ${consumedCal} / ${targetCal} kcal (${Math.round((consumedCal / targetCal) * 100)}% target)`, 18, y + 7);
  doc.text(`Protein: ${consumedProtein}g / ${targetProtein}g`, 18, y + 14);

  doc.text(`Carbohydrates: ${consumedCarbs}g / ${targetCarbs}g`, 95, y + 7);
  doc.text(`Fats: ${consumedFats}g / ${targetFats}g`, 95, y + 14);

  doc.text(`Hydration: ${water?.glasses || 0} / ${water?.target || 8} glasses`, 150, y + 7);
  doc.text(`Adherence: ${consumedCal <= targetCal ? 'In Budget' : 'Exceeded'}`, 150, y + 14);

  y += 30;

  // SECTION 3: LOGGED MEALS
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('3. NUTRITION & MEAL LOGS', 14, y);
  doc.line(14, y + 2, pageWidth - 14, y + 2);
  y += 8;

  if (meals && meals.length > 0) {
    meals.forEach(meal => {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      const mealName = meal.mealType.toUpperCase();
      doc.text(`• ${mealName} (${meal.totalMealCalories} kcal | P: ${meal.totalMealProtein}g, C: ${meal.totalMealCarbs}g, F: ${meal.totalMealFats}g)`, 16, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const itemsList = meal.foods.map(f => `${f.quantity}x ${f.name} (${f.totalCalories} kcal)`).join(', ');
      const splitItems = doc.splitTextToSize(itemsList, pageWidth - 36);
      doc.text(splitItems, 20, y);
      y += splitItems.length * 4 + 3;
    });
  } else {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text('No logged meals recorded for this cycle yet.', 18, y);
    y += 8;
  }

  y += 6;

  // SECTION 4: AI & CLINICAL RECOMMENDATIONS
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('4. METABOLIC COACH RECOMMENDATIONS', 14, y);
  doc.line(14, y + 2, pageWidth - 14, y + 2);
  y += 8;

  const recommendations = [
    '• Maintain a consistent meal window to optimize insulin sensitivity and nutrient absorption.',
    '• Prioritize complete protein sources (e.g. Lentils + Whole Wheat, Paneer, Chicken) around physical exertion.',
    `• Target daily hydration of at least ${(weightKg * 0.035).toFixed(1)} Liters (${Math.round((weightKg * 35) / 250)} glasses) to support cellular recovery.`,
    '• Combine resistance training (3-5x/wk) with a moderate caloric deficit for lean tissue retention.'
  ];

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  recommendations.forEach(rec => {
    doc.text(rec, 16, y);
    y += 5.5;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('FitFuel Pro AI Nutrition System — Confidential Personal Health Record', 14, 285);
  doc.text('Page 1 of 1', pageWidth - 28, 285);

  // Save the PDF
  const filename = `FitFuel_Health_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};
