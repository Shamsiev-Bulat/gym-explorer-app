export function filterExercises(exercises, { search, category, equipment, lang, favoritesOnly, favorites }) {
    const searchLower = (search || '').toLowerCase();
    
    return exercises.filter(ex => {
        const nameMatch = ex.name.toLowerCase().includes(searchLower);
        const instrMatch = 
            ex.instructions[lang]?.toLowerCase().includes(searchLower) || 
            ex.instructions['en']?.toLowerCase().includes(searchLower);
        const matchEquip = equipment ? ex.equipment === equipment : true;
        const matchCat = category ? ex.category === category : true;
        const matchFav = favoritesOnly ? favorites.includes(ex.id) : true;
        
        return (nameMatch || instrMatch) && matchEquip && matchCat && matchFav;
    });
}

export function getUniqueValues(exercises, field) {
    return [...new Set(exercises.map(ex => ex[field]))].sort();
}
