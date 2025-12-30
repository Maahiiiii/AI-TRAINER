export const LOCAL_Note = "This file is a bridge to switch between local assets and remote URLs.";

// Keys MUST match the exercise IDs used in the database/app
export const EXERCISE_IMAGES: Record<string, any> = {
    // Core Exercises
    'bicep-curls': "https://res.cloudinary.com/ddtslpjdf/image/upload/v1767027803/bicep-curls_upoegx.jpg",
    'push-ups': "https://res.cloudinary.com/ddtslpjdf/image/upload/v1767027970/push-ups_u37jsf.jpg",
    'squats': "https://res.cloudinary.com/ddtslpjdf/image/upload/v1767027988/squats_yqbz5e.jpg",
    'plank': "https://res.cloudinary.com/ddtslpjdf/image/upload/v1767027907/plank_nrvrje.jpg",
    'lunges': "https://res.cloudinary.com/ddtslpjdf/image/upload/v1767027972/lunges_azuxub.png",
    'glute-bridges': "https://res.cloudinary.com/ddtslpjdf/image/upload/v1767027868/glute-bridges_uig1yt.png",
    'side-plank': "https://res.cloudinary.com/ddtslpjdf/image/upload/v1767027987/side-plank_ueuzas.png",
    'wall-sit': "https://res.cloudinary.com/ddtslpjdf/image/upload/v1767028010/wall-sit_pnzyus.png",
    'tricep-dips': "https://res.cloudinary.com/ddtslpjdf/image/upload/v1767028038/tricep-dips_lwrclh.png",
    'bird-dog': "https://res.cloudinary.com/ddtslpjdf/image/upload/v1767027855/bird-dog_dte0rm.png",
    'calf-raises': "https://res.cloudinary.com/ddtslpjdf/image/upload/v1767027899/calf-raises_wbrpw5.png",
    'superman': "https://res.cloudinary.com/ddtslpjdf/image/upload/v1767027997/superman_xqjp2z.png",
    'bicycle-crunches': "https://res.cloudinary.com/ddtslpjdf/image/upload/v1767027881/bicycle-crunches_zsmmpo.png",
    'reverse-lunges': "https://res.cloudinary.com/ddtslpjdf/image/upload/v1767028007/reverse-lunges_loobzn.png",
    'pike-pushups': "https://res.cloudinary.com/ddtslpjdf/image/upload/v1767027978/pike-pushups_ogckei.png",

    // Advanced / Machine / Other
    'db_shoulder_press': "https://res.cloudinary.com/ddtslpjdf/image/upload/v1767027972/db-shoulder-press_lm8mkh.png",
    'rb_row': "https://res.cloudinary.com/ddtslpjdf/image/upload/v1767028012/rb-row_niabra.png",
    'rb_chest_press': "https://res.cloudinary.com/ddtslpjdf/image/upload/v1767028014/rb-chest-press_pihifc.png",
    'pb_pullup_standard': "https://res.cloudinary.com/ddtslpjdf/image/upload/v1767027998/pullups_mv1rxw.png",
    'kb_swing': "https://res.cloudinary.com/ddtslpjdf/image/upload/v1767027990/kb-swing_ruffoy.png",
    'kb_snatch': "https://res.cloudinary.com/ddtslpjdf/image/upload/v1767027886/kb-snatch._pfa9qz.png",
    'bb_squat': "https://res.cloudinary.com/ddtslpjdf/image/upload/v1767027967/bb-squat_fysaba.png",
    'bb_bench_press': "https://res.cloudinary.com/ddtslpjdf/image/upload/v1767027895/bb-bench-press_usbibb.png",
    'cable_lat_pulldown': "https://res.cloudinary.com/ddtslpjdf/image/upload/v1767027856/cable-lat-pulldown_csw5g8.png",
    'cable_tricep_pushdown': "https://res.cloudinary.com/ddtslpjdf/image/upload/v1767028785/cable-tricep-pushdown_aqgecv.jpg",
    'machine_leg_press': "https://res.cloudinary.com/ddtslpjdf/image/upload/v1767028788/leg-press_beqeem.jpg",
    'smith_squat': "https://res.cloudinary.com/ddtslpjdf/image/upload/v1767028786/smith-squat_rsevv4.jpg",
    'bench_bulgarian_split_squat': "https://res.cloudinary.com/ddtslpjdf/image/upload/v1767028784/bulgarian-split-squat_txpmia.jpg",

    // Logos and Misc (Keeping local for now as no URI provided)
    'fizi-logo': require('../../assets/fizi-logo.png'),
};

// Helper function to get image source (safe for both require and URI)
export const getExerciseImage = (key: string) => {
    const image = EXERCISE_IMAGES[key];

    // If it's a string (remote URL), return uri object
    if (typeof image === 'string') {
        return { uri: image };
    }

    // If it's a number (local require) or object, return it directly
    return image;
};
