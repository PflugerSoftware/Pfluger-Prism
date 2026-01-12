/**
 * Import Liberty Hill Schools via API
 *
 * This script can be run in the browser console or via Node.js
 * to import all Liberty Hill schools using the existing facilities API
 */

const API_BASE = 'https://prism.pflugerarchitects.com/api';

// Load the Liberty Hill schools data
async function loadSchoolsData() {
    try {
        const response = await fetch('/data/liberty_hill_schools.json');
        return await response.json();
    } catch (error) {
        console.error('Error loading schools data:', error);
        throw error;
    }
}

// Map school type to facility type
function mapSchoolType(schoolType) {
    const mappings = {
        'Elementary School': 'Elementary',
        'Middle School': 'Middle',
        'High School': 'High School',
        'Elementary/Secondary': 'Specialty'
    };
    return mappings[schoolType] || 'District';
}

// Determine status based on school characteristics
function determineStatus(school) {
    if (school.school_name === 'FUTURE H S' && school.enrollment === 0) {
        return 'Planned';
    }
    if (school.school_name === 'LEGACY RANCH H S' && school.grade_range === "'09") {
        return 'Under Construction';
    }
    return 'Existing';
}

// Clean grade range (remove leading apostrophe)
function cleanGradeRange(gradeRange) {
    return gradeRange.replace(/^'/, '');
}

// Create a facility via API
async function createFacility(facilityData) {
    try {
        const response = await fetch(`${API_BASE}/facilities.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(facilityData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating facility:', facilityData.name, error);
        throw error;
    }
}

// Main import function
async function importLibertyHillSchools() {
    console.log('========================================');
    console.log('Liberty Hill Schools Import');
    console.log('========================================\n');

    try {
        // Load schools data
        console.log('Loading schools data...');
        const schools = await loadSchoolsData();
        console.log(`Found ${schools.length} schools to import\n`);

        let successCount = 0;
        let errorCount = 0;
        const results = [];

        // Import each school
        for (const school of schools) {
            // Transform data
            const facilityData = {
                name: school.school_name.trim(),
                facility_type: mapSchoolType(school.school_type),
                address: `${school.address.trim()}, ${school.city.trim()}, ${school.state.trim()} ${school.zip.trim()}`,
                latitude: school.coordinates.latitude,
                longitude: school.coordinates.longitude,
                current_enrollment: parseInt(school.enrollment) || 0,
                status: determineStatus(school),
                grade_range: cleanGradeRange(school.grade_range),
                principal: school.principal ? school.principal.trim() : null,
                phone: school.phone.trim()
            };

            try {
                console.log(`Importing: ${facilityData.name} (${facilityData.facility_type})...`);
                const result = await createFacility(facilityData);
                successCount++;
                results.push({
                    success: true,
                    school: facilityData.name,
                    id: result.id
                });
                console.log(`  ✓ Success! ID: ${result.id}`);
            } catch (error) {
                errorCount++;
                results.push({
                    success: false,
                    school: facilityData.name,
                    error: error.message
                });
                console.log(`  ✗ Error: ${error.message}`);
            }
        }

        // Summary
        console.log('\n========================================');
        console.log('Import Complete!');
        console.log('========================================');
        console.log(`Successfully imported: ${successCount} schools`);
        if (errorCount > 0) {
            console.log(`Errors encountered: ${errorCount}`);
        }

        return results;

    } catch (error) {
        console.error('Import failed:', error);
        throw error;
    }
}

// Run the import if this is the main script
if (typeof window !== 'undefined') {
    // Browser environment
    console.log('Run importLibertyHillSchools() to start the import');
    window.importLibertyHillSchools = importLibertyHillSchools;
} else {
    // Node.js environment
    importLibertyHillSchools().then(results => {
        console.log('\nDetailed results:', JSON.stringify(results, null, 2));
    }).catch(error => {
        console.error('Import failed:', error);
        process.exit(1);
    });
}