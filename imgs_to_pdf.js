const filesInput = document.getElementById("files");
const carousel = document.getElementById("carousel");
const pdfLink = document.getElementById("pdf-link");
filesInput.addEventListener("change", async function () {
  carousel.innerHTML = "";
  const pdfDoc = await PDFLib.PDFDocument.create();
  const pdfImages = [];
  let loadedCount = 0;
  const expectedCount = filesInput.files.length;
  for (let i = 0; i < filesInput.files.length; i++) {
    const file = filesInput.files[i];
    const image = document.createElement("img");
    image.alt = file.name;
    image.title = file.name;
    carousel.appendChild(image);
    const reader = new FileReader();
    reader.onload = async function (e) {
      const dataUri = e.target.result;
      pdfImages[i] =
        await pdfDoc[file.name.endsWith(".png") ? "embedPng" : "embedJpg"](
          dataUri,
        );
      image.src = dataUri;
      loadedCount++;
      if (loadedCount === expectedCount) {
        for (const pdfImage of pdfImages) {
          const page = pdfDoc.addPage();
          let dims = pdfImage.scale(1.0);
          const scale = Math.min(
            page.getWidth() / dims.width,
            page.getHeight() / dims.height,
          );
          if (scale < 1.0) {
            dims = pdfImage.scale(scale);
          }
          page.drawImage(pdfImage, {
            x: Math.max(0, page.getWidth() - dims.width),
            y: Math.max(0, page.getHeight() - dims.height),
            width: dims.width,
            height: dims.height,
          });
        }
        pdfLink.textContent = "Download PDF";
        pdfLink.href = await pdfDoc.saveAsBase64({ dataUri: true });
      }
    };
    reader.readAsDataURL(file);
  }
});
