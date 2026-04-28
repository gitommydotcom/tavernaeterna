const CLOUD_NAME = 'dywtbbbuq'
const UPLOAD_PRESET = 'ml_default'

export async function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) throw new Error('Upload fallito')
  const data = await res.json()
  return data.secure_url
}

export function cloudinaryUrl(url, options = {}) {
  if (!url || !url.includes('cloudinary.com')) return url
  const { width, height, crop = 'fill', quality = 'auto' } = options
  const transforms = [
    width && `w_${width}`,
    height && `h_${height}`,
    `c_${crop}`,
    `q_${quality}`,
    'f_auto',
  ].filter(Boolean).join(',')

  return url.replace('/upload/', `/upload/${transforms}/`)
}
