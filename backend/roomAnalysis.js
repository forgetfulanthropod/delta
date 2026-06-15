/** Heuristic room analysis from prompt/tweaks and optional vision description text. */

function inferRoomType(text) {
  const t = text.toLowerCase();
  if (t.includes('kitchen') || t.includes('cabinet') || t.includes('island') || t.includes('countertop')) {
    return 'kitchen';
  }
  if (t.includes('bath') || t.includes('shower') || t.includes('vanity') || t.includes('toilet')) {
    return 'bathroom';
  }
  if (t.includes('bedroom') || t.includes('closet') || t.includes('nightstand')) {
    return 'bedroom';
  }
  if (t.includes('living') || t.includes('family') || t.includes('fireplace') || t.includes('sofa')) {
    return 'living_room';
  }
  if (t.includes('dining') || t.includes('table')) {
    return 'dining_room';
  }
  return 'general_interior';
}

function inferIssues(text) {
  const t = text.toLowerCase();
  const issues = [];
  if (t.includes('dated') || t.includes('old') || t.includes('peeling') || t.includes('dilapidat')) {
    issues.push('dated_finishes');
  }
  if (t.includes('dark') || t.includes('dim') || t.includes('poor light')) {
    issues.push('poor_lighting');
  }
  if (t.includes('cramped') || t.includes('small') || t.includes('tight')) {
    issues.push('tight_layout');
  }
  if (t.includes('damage') || t.includes('broken') || t.includes('shatter') || t.includes('decay')) {
    issues.push('structural_or_surface_damage');
  }
  if (t.includes('clutter') || t.includes('overgrown') || t.includes('messy')) {
    issues.push('clutter_or_overgrowth');
  }
  return issues;
}

function materialsForRoom(roomType, tweaks) {
  const materials = [];
  if (roomType === 'kitchen') {
    materials.push('cabinet_hardware', 'countertop_quartz', 'backsplash_tile', 'pendant_lighting', 'sink_faucet');
  } else if (roomType === 'bathroom') {
    materials.push('vanity', 'tile', 'shower_fixture', 'mirror_lighting');
  } else if (roomType === 'bedroom') {
    materials.push('closet_system', 'interior_paint', 'flooring_lvp', 'ceiling_fan');
  } else {
    materials.push('flooring_lvp', 'interior_paint', 'trim_molding', 'recessed_lighting');
  }
  const style = (tweaks.style || '').toLowerCase();
  const palette = (tweaks.colorPalette || '').toLowerCase();
  if (style.includes('modern') || style.includes('minimal')) materials.push('matte_black_fixtures');
  if (palette.includes('warm') || palette.includes('oak') || palette.includes('earth')) {
    materials.push('oak_flooring');
  }
  if (palette.includes('bold') || style.includes('industrial')) materials.push('statement_lighting');
  return [...new Set(materials)];
}

function buildRoomAnalysis({ prompt = '', tweaks = {}, imageDescription = '' }) {
  const combined = [prompt, Object.values(tweaks).join(' '), imageDescription].filter(Boolean).join(' ');
  const roomType = inferRoomType(combined);
  const issues = inferIssues(combined);
  const suggestedMaterials = materialsForRoom(roomType, tweaks);
  const style = tweaks.style || 'updated';
  const scopeHint = imageDescription
    ? `Remodel ${roomType.replace(/_/g, ' ')} informed by vision analysis (${style} direction)`
    : `Remodel ${roomType.replace(/_/g, ' ')} with ${style} aesthetic`;

  return {
    roomType,
    issues,
    suggestedMaterials,
    scopeHint,
  };
}

module.exports = {
  buildRoomAnalysis,
  inferRoomType,
  inferIssues,
  materialsForRoom,
};