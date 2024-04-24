// Utility function to convert weight
function convertWeight(weight, unit) {
    const conversions = { lbs: 0.453592, stone: 6.35029 };
    return weight * (conversions[unit] || 1);
  }
  
  // Utility function to convert height
  function convertHeight(height, unit) {
    if (unit === 'ftin') {
      const [feet, inches] = height.toString().split('.').map(parseFloat);
      return feet * 30.48 + inches * 2.54;
    }
    return parseFloat(height);
  }
  
  module.exports = { convertWeight, convertHeight };  