// Pollinations.ai Image Generation System
const ImageSystem = {
  baseUrl: 'https://image.pollinations.ai/prompt/',
  cache: {},

  stylePrefix: 'anime style, dark gold and bronze tones, ancient chinese mythology, sanxingdui civilization, mysterious atmosphere, detailed illustration, ',

  prompts: {
    // Scenes
    scene_altar: 'ancient bronze altar temple interior, sacred ritual room with bronze pillars, dark stone floor, torch light, sanxingdui bronze masks on walls, mysterious golden glow, detective noir atmosphere',
    scene_court: 'ancient chinese royal court hall, stone throne room with bronze decorations, multiple officials seated, torchlit, dark and tense atmosphere, sanxingdui style architecture',
    scene_waterway: 'underground ancient water channel tunnel, dark stone passage with shallow water, oil lamp reflections, mysterious bronze age drainage system, narrow crawlspace',
    scene_forge: 'ancient bronze casting workshop, glowing furnaces, molten metal, craftsman tools, bronze weapons and masks hanging, smoke and fire, dramatic lighting',
    scene_archive: 'ancient chinese palace secret archive room, bamboo scrolls on stone shelves, turtle shells with inscriptions, dim candlelight, dusty mysterious atmosphere',
    scene_inn: 'ancient chinese guest house at night, wooden two-story building, paper lanterns, moonlight, suspicious shadows, courtyard with old tree',

    // Characters
    char_cancon: 'elderly chinese priest in black ritual robe with golden sun bird emblem, thin face, dead body pose, bronze dagger in chest, ancient shu kingdom style',
    char_baiguan: 'pale middle-aged chinese man in grey priest robes, nervous expression, herb-stained fingers, shifty eyes, ancient shu kingdom official',
    char_yufu: 'muscular chinese general in bronze armor, stern face, short beard, military bearing, red cinnabar dust on shoulder armor, ancient warrior',
    char_duyu: 'handsome young chinese diplomat in dark blue foreign robes, charming smile, slightly darker skin, elegant posture, hidden danger in eyes',
    char_empress: 'young beautiful chinese empress with gold crown, cold elegant expression, dark red royal dress, powerful aura, ancient shu kingdom queen',
    char_zhulong: 'stocky middle-aged chinese blacksmith with burn scars on arms, rough hands with copper-green stains, tired honest face, leather apron',
    char_atong: 'teenage chinese apprentice boy, round face, nervous expression, looking down, simple work clothes, bronze foundry background',
    char_ayue: 'young chinese maid with suspiciously delicate hands, grey servant dress, hidden intelligence in eyes, foreign subtle features',

    // Items
    item_dagger: 'ornate bronze short sword with coiled snake emblem and turquoise eye inlay, ancient chinese craftsmanship, detailed metalwork, dark background',
    item_fragment: 'glowing bronze tree-shaped fragment piece, ancient artifact with branch patterns, mystical blue light emanating, palm-sized',
    item_oil: 'small bronze bottle with exotic waterproof oil, ancient container, mysterious liquid, foreign craftsmanship',
    item_scale: 'tiny bronze decorative scale piece from belt, cloud pattern engraving, broken edge, evidence photograph style',

    // Title/UI
    title_bg: 'massive sacred bronze tree towering into dark sky, sanxingdui golden masks floating around, ancient shu kingdom ruins, epic mystical scene, wide cinematic shot',
  },

  getImageUrl(key, width = 800, height = 500) {
    const prompt = this.prompts[key];
    if (!prompt) return '';
    const fullPrompt = this.stylePrefix + prompt;
    const encoded = encodeURIComponent(fullPrompt);
    return `${this.baseUrl}${encoded}?width=${width}&height=${height}&nologo=true&seed=${this.getSeed(key)}`;
  },

  getSeed(key) {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash) + key.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % 100000;
  },

  loadImage(key, imgElement, width = 800, height = 500) {
    const url = this.getImageUrl(key, width, height);
    if (!url) return;

    if (this.cache[key]) {
      imgElement.src = this.cache[key];
      imgElement.classList.add('loaded');
      return;
    }

    imgElement.classList.add('loading');
    const img = new Image();
    img.onload = () => {
      this.cache[key] = url;
      imgElement.src = url;
      imgElement.classList.remove('loading');
      imgElement.classList.add('loaded');
    };
    img.onerror = () => {
      imgElement.classList.remove('loading');
      imgElement.classList.add('error');
    };
    img.src = url;
  },

  preloadScene(sceneKey) {
    const url = this.getImageUrl(sceneKey);
    if (url && !this.cache[sceneKey]) {
      const img = new Image();
      img.onload = () => { this.cache[sceneKey] = url; };
      img.src = url;
    }
  }
};
