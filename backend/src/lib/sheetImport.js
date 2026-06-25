// Shared CSV-to-Product parsing logic, used by both the CLI import script
// (src/importFromSheet.js) and the POST /api/products/import-sheet endpoint.

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  text = text.replace(/^﻿/, ''); // strip BOM if present

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\r') {
      // ignore, \n handles the line break
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

export function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toCents(value) {
  if (value === undefined || value === null || value === '') return undefined;
  const num = Number(value);
  if (Number.isNaN(num)) return undefined;
  return Math.round(num * 100);
}

function toBool(value) {
  return String(value).trim().toUpperCase() === 'TRUE';
}

// Converts a Google Drive "view" share link into a directly-loadable image URL.
function normalizeImageUrl(url) {
  if (!url) return null;
  const match = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (match) {
    // drive.google.com/uc?export=view sets Cross-Origin-Resource-Policy: same-site,
    // which browsers block when the image is embedded on another origin (<img> tag).
    // lh3.googleusercontent.com serves the same file without that restriction.
    return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }
  return url.trim() || null;
}

function buildProduct(record, warnings) {
  const name = record['Product Name']?.trim() || record['Product']?.trim();
  if (!name) {
    warnings.push('Skipped row: no name (neither "Product Name" nor "Product" filled in).');
    return null;
  }

  const description = record['description']?.trim();
  if (!description) {
    warnings.push(`Skipped "${name}": missing description (required field).`);
    return null;
  }

  const price = toCents(record['price (AED)']);
  if (price === undefined) {
    warnings.push(`Skipped "${name}": missing/invalid price.`);
    return null;
  }

  const category = record['category']?.trim();
  if (!category) {
    warnings.push(`Skipped "${name}": missing category.`);
    return null;
  }

  const university = record['university']?.trim() || '';

  const genderRaw = record['gender']?.trim().toLowerCase();
  const gender = ['men', 'women', 'unisex'].includes(genderRaw) ? genderRaw : 'unisex';
  if (genderRaw && gender !== genderRaw) {
    warnings.push(`"${name}": unrecognized gender "${record['gender']}", defaulted to "unisex".`);
  }

  const images = [0, 1, 2, 3]
    .map((i) => normalizeImageUrl(record[`images[${i}]${i === 0 ? ' F' : i === 1 ? ' B' : i === 2 ? ' R' : ' L'}`]))
    .filter(Boolean);

  const sizes = [0, 1, 2, 3, 4]
    .map((i) => record[`sizes[${i}]`]?.trim())
    .filter(Boolean);

  const colors = [];
  for (let i = 0; i < 4; i++) {
    const colorName = record[`colors[${i}].name`]?.trim();
    const hex = record[`colors[${i}].hex`]?.trim();
    if (colorName && hex) {
      colors.push({ name: colorName, hex });
    } else if (colorName && !hex) {
      warnings.push(`"${name}": color "${colorName}" has no hex code, skipped.`);
    }
  }

  const compareAt = toCents(record['compareAt']);

  const product = {
    slug: slugify(name),
    name,
    description,
    price,
    category,
    university,
    gender,
    images,
    sizes,
    colors,
    stock: Number(record['stock']) || 0,
    featured: toBool(record['featured']),
    reviewCount: Number(record['reviewCount']) || 0,
    badge: record['badge']?.trim() || undefined,
  };

  if (compareAt !== undefined) product.compareAt = compareAt;
  const rating = Number(record['rating']);
  if (record['rating'] && !Number.isNaN(rating)) product.rating = rating;

  return product;
}

// Parses raw CSV text into { products, warnings, totalRows }.
// Pure function, does not touch the database.
export function parseProductsFromCsv(text) {
  const rows = parseCsv(text);
  const header = rows[0] || [];
  const dataRows = rows.slice(1);

  const warnings = [];
  const products = [];
  const slugCounts = new Map();

  for (const row of dataRows) {
    const record = {};
    header.forEach((col, i) => {
      record[col] = row[i] ?? '';
    });

    const product = buildProduct(record, warnings);
    if (!product) continue;

    // De-duplicate slugs (e.g. two rows both named "University of Birmingham Hoodie").
    const baseSlug = product.slug;
    const count = slugCounts.get(baseSlug) || 0;
    slugCounts.set(baseSlug, count + 1);
    if (count > 0) {
      product.slug = `${baseSlug}-${count + 1}`;
      warnings.push(`Duplicate name "${product.name}" -> slug renamed to "${product.slug}". Check if this should really be a separate product.`);
    }

    products.push(product);
  }

  return { products, warnings, totalRows: dataRows.length };
}
