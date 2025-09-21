// Script de prueba para verificar la detección de combos
// Ejecutar en la consola del navegador para verificar que funciona

console.log('🧪 INICIANDO PRUEBA DE DETECCIÓN DE COMBOS');

// Simular los datos de COMBOS
const COMBOS = [
  { id: "netflix_disney_std", name: "Netflix + Disney Estándar", price: 6.0, billing: "monthly", color: "bg-gradient-to-r from-red-600 to-blue-500", logo: "N+D" },
  { id: "netflix_disney_premium", name: "Netflix + Disney Premium", price: 6.5, billing: "monthly", color: "bg-gradient-to-r from-red-600 to-blue-600", logo: "N+D+" },
  { id: "netflix_max", name: "Netflix + Max", price: 5.5, billing: "monthly", color: "bg-gradient-to-r from-red-600 to-purple-700", logo: "N+MAX" },
  { id: "netflix_prime", name: "Netflix + Prime Video", price: 5.0, billing: "monthly", color: "bg-gradient-to-r from-red-600 to-sky-700", logo: "N+PV" },
  { id: "disney_max", name: "Disney+ Premium + Max", price: 5.0, billing: "monthly", color: "bg-gradient-to-r from-blue-600 to-purple-700", logo: "D+MAX" },
  { id: "prime_disney", name: "Prime Video + Disney+ Premium", price: 5.0, billing: "monthly", color: "bg-gradient-to-r from-sky-700 to-blue-600", logo: "PV+D+" },
  { id: "mega_combo", name: "Netflix + Max + Disney + Prime + Paramount", price: 11.5, billing: "monthly", color: "bg-gradient-to-r from-red-600 via-purple-700 via-blue-500 via-sky-700 to-indigo-600", logo: "MEGA" },
  { id: "spotify_netflix", name: "Spotify + Netflix", price: 6.5, billing: "monthly", color: "bg-gradient-to-r from-emerald-600 to-red-600", logo: "SP+N" },
  { id: "spotify_disney_premium", name: "Spotify + Disney Premium", price: 6.5, billing: "monthly", color: "bg-gradient-to-r from-emerald-600 to-blue-600", logo: "SP+D+" }
];

// Función isCombo (corregida)
const isCombo = (serviceName) => {
  return COMBOS.some(combo => combo.name === serviceName);
};

// Función getComboServices (corregida)
const getComboServices = (serviceName) => {
  const comboMap = {
    'Netflix + Disney Estándar': ['Netflix', 'Disney+ Estándar'],
    'Netflix + Disney Premium': ['Netflix', 'Disney+ Premium'],
    'Netflix + Max': ['Netflix', 'Max'],
    'Netflix + Prime Video': ['Netflix', 'Prime Video'],
    'Disney+ Premium + Max': ['Disney+ Premium', 'Max'],
    'Prime Video + Disney+ Premium': ['Prime Video', 'Disney+ Premium'],
    'Netflix + Max + Disney + Prime + Paramount': ['Netflix', 'Max', 'Disney+ Premium', 'Prime Video', 'Paramount+'],
    'Spotify + Netflix': ['Spotify', 'Netflix'],
    'Spotify + Disney Premium': ['Spotify', 'Disney+ Premium']
  };
  
  return comboMap[serviceName] || [];
};

// Casos de prueba
const testCases = [
  { service: "Netflix", expected: false, type: "Servicio individual" },
  { service: "Disney+ Premium", expected: false, type: "Servicio individual" },
  { service: "Netflix + Disney Premium", expected: true, type: "Combo" },
  { service: "Netflix + Max", expected: true, type: "Combo" },
  { service: "Spotify + Netflix", expected: true, type: "Combo" },
  { service: "Mega Combo", expected: false, type: "Nombre incorrecto" }
];

console.log('📋 EJECUTANDO CASOS DE PRUEBA:');
console.log('================================');

testCases.forEach((testCase, index) => {
  const result = isCombo(testCase.service);
  const status = result === testCase.expected ? '✅' : '❌';
  
  console.log(`${index + 1}. ${status} "${testCase.service}"`);
  console.log(`   Esperado: ${testCase.expected ? 'Combo' : 'Servicio individual'}`);
  console.log(`   Resultado: ${result ? 'Combo' : 'Servicio individual'}`);
  console.log(`   Tipo: ${testCase.type}`);
  
  if (result) {
    const services = getComboServices(testCase.service);
    console.log(`   Servicios del combo: [${services.join(', ')}]`);
  }
  
  console.log('');
});

// Prueba específica del caso problemático
console.log('🎯 PRUEBA ESPECÍFICA DEL CASO PROBLEMÁTICO:');
console.log('==========================================');
const problematicCase = "Netflix + Disney Premium";
const isComboResult = isCombo(problematicCase);
const comboServices = getComboServices(problematicCase);

console.log(`Servicio: "${problematicCase}"`);
console.log(`¿Es combo?: ${isComboResult ? 'SÍ' : 'NO'}`);
console.log(`Servicios individuales: [${comboServices.join(', ')}]`);

if (isComboResult && comboServices.length > 0) {
  console.log('✅ ¡DETECCIÓN DE COMBOS FUNCIONANDO CORRECTAMENTE!');
} else {
  console.log('❌ La detección de combos no está funcionando');
}

console.log('🎉 PRUEBA COMPLETADA');

