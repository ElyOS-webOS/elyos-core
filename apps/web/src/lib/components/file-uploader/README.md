# FileUploader Komponens

A FileUploader egy rugalmas fájlfeltöltő komponens két különböző működési móddal.

## Használat

```svelte
<script>
	import { FileUploader } from '$lib/components/file-uploader';

	function handleUploadComplete(result) {
		if (result.success) {
			console.log('Feltöltött fájl:', result.file);
		}
	}
</script>

<FileUploader
	mode="instant"
	category="avatars"
	scope="user"
	maxFiles={1}
	fileType="image"
	maxFileSize={5 * 1024 * 1024}
	generateThumbnail={true}
	onUploadComplete={handleUploadComplete}
/>
```

## Módok

### Standard Mód (alapértelmezett)

A klasszikus feltöltő mód, ahol:

- A felhasználó kiválaszthat egy vagy több fájlt
- A fájlok megjelennek egy listában előnézettel
- A felhasználó törölhet fájlokat a listából
- Külön "Feltöltés" gombbal indítható a feltöltés
- Látható a feltöltési folyamat minden fájlnál

```svelte
<FileUploader category="documents" scope="shared" maxFiles={5} fileType="document" />
```

### Instant Mód

Kompakt, azonnali feltöltő mód, ahol:

- Egyszerűbb, kompaktabb kinézet
- Nincs fájl lista előnézet
- A kiválasztott fájl azonnal feltöltődik
- Ideális avatar vagy egyedi fájl feltöltéshez
- Feltöltés közben loading állapot jelenik meg

```svelte
<FileUploader
	mode="instant"
	category="avatars"
	scope="user"
	maxFiles={1}
	fileType="image"
	generateThumbnail={true}
	onUploadStart={() => console.log('Feltöltés kezdődik...')}
	onUploadComplete={handleUploadComplete}
/>
```

## Props

| Prop                | Típus                              | Alapértelmezett   | Leírás                                      |
| ------------------- | ---------------------------------- | ----------------- | ------------------------------------------- |
| `mode`              | `'standard' \| 'instant'`          | `'standard'`      | Feltöltő mód                                |
| `category`          | `string`                           | **kötelező**      | Fájl kategória (pl. "avatars", "documents") |
| `scope`             | `'user' \| 'shared'`               | **kötelező**      | Hozzáférési kör                             |
| `maxFileSize`       | `number`                           | `10485760` (10MB) | Maximum fájlméret bájtban                   |
| `maxFiles`          | `number`                           | `1`               | Maximum feltölthető fájlok száma            |
| `fileType`          | `'image' \| 'document' \| 'mixed'` | `'mixed'`         | Fájl típus kategória                        |
| `allowedExtensions` | `string[]`                         | `[]`              | Engedélyezett kiterjesztések                |
| `generateThumbnail` | `boolean`                          | `false`           | Bélyegkép generálás képekhez                |
| `maxImageWidth`     | `number`                           | `undefined`       | Maximum képszélesség                        |
| `maxImageHeight`    | `number`                           | `undefined`       | Maximum képmagasság                         |
| `onUploadComplete`  | `(result: UploadResult) => void`   | `undefined`       | Feltöltés befejezésekor                     |
| `onError`           | `(error: UploadError) => void`     | `undefined`       | Hiba esetén                                 |
| `onUploadStart`     | `() => void`                       | `undefined`       | Feltöltés kezdetekor (csak instant módban)  |

## Példák

### Avatar feltöltés instant móddal

```svelte
<FileUploader
	mode="instant"
	category="avatars"
	scope="user"
	maxFiles={1}
	fileType="image"
	maxFileSize={5 * 1024 * 1024}
	generateThumbnail={true}
	onUploadStart={() => (isSaving = true)}
	onUploadComplete={(result) => {
		if (result.success) {
			avatarUrl = result.file.url;
			toast.success('Avatar feltöltve!');
		}
		isSaving = false;
	}}
	onError={(error) => {
		toast.error(error.message);
		isSaving = false;
	}}
/>
```

### Dokumentum feltöltés standard móddal

```svelte
<FileUploader
	category="documents"
	scope="shared"
	maxFiles={10}
	fileType="document"
	maxFileSize={20 * 1024 * 1024}
	onUploadComplete={(result) => {
		if (result.success) {
			documents = [...documents, result.file];
		}
	}}
/>
```

### Képek feltöltése bélyegképpel

```svelte
<FileUploader
	category="gallery"
	scope="user"
	maxFiles={5}
	fileType="image"
	generateThumbnail={true}
	maxImageWidth={1920}
	maxImageHeight={1080}
	onUploadComplete={(result) => {
		if (result.success) {
			images = [...images, result.file];
		}
	}}
/>
```

## Típusok

```typescript
type UploaderMode = 'standard' | 'instant';

interface UploadResult {
	success: boolean;
	file?: ProcessedFile;
	error?: string;
}

interface ProcessedFile {
	id: string;
	originalName: string;
	mimeType: string;
	size: number;
	url: string;
	thumbnailUrl?: string;
}

interface UploadError {
	code: string;
	message: string;
	field?: string;
}
```
