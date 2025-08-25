import Products from "../models/productModels.js";
import fs from "fs";
import path from "path";

export const getProducts = async (req, res) => {
  try {
    const response = await Products.findAll();
    res.json(response);
  } catch (error) {
    res.json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const response = await Products.findOne({
      where: {
        id: req.params.id,
      },
    });
    res.json(response);
  } catch (error) {
    res.json({ message: error.message });
  }
};

export const saveProduct = async (req, res) => {
  if (!req.files) return res.status(400).json({ msg: "No File Uploaded" });
  const name = req.body.name;
  const file = req.files.file;
  const fileSize = file.data.length;
  const ext = file.mimetype.split("/")[1];
  const fileName = file.md5 + "." + ext;
  const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
  const allowedType = ["image/png", "image/jpg", "image/jpeg"];

  if (!allowedType.includes(file.mimetype))
    return res.status(422).json({ msg: "Invalid Images" });
  if (fileSize > 5000000)
    return res.status(422).json({ msg: "Image must be less than 5 MB" });

  file.mv(`./public/images/${fileName}`, async (err) => {
    if (err) return res.status(500).json({ msg: err.message });
    try {
      await Products.create({ name: name, image: fileName, url: url });
      res.status(201).json({ msg: "Product Created Successfuly" });
    } catch (error) {
      console.log(error.message);
    }
  });
};


export const updateProduct = async (req, res) => {
  try {
    // Cari produk di DB
    const product = await Products.findOne({
      where: { id: req.params.id },
    });

    if (!product) {
      return res.status(404).json({ msg: "No Data Found" });
    }

    let fileName = product.image; // default pakai gambar lama

    if (req.files !== null) {
      const file = req.files.file;
      const fileSize = file.data.length;
      const ext = file.mimetype.split("/")[1];
      fileName = file.md5 + "." + ext;

      const allowedType = ["image/png", "image/jpg", "image/jpeg"];

      if (!allowedType.includes(file.mimetype)) {
        return res.status(422).json({ msg: "Invalid Images" });
      }
      if (fileSize > 5000000) {
        return res
          .status(422)
          .json({ msg: "Image must be less than 5 MB" });
      }

      // hapus file lama
      const filepath = path.join("./public/images", product.image);
      fs.unlink(filepath, (err) => {
        if (err) {
          console.log("File not found, skipping delete:", err.message);
        }
      });

      // simpan file baru
      await file.mv(`./public/images/${fileName}`);
    }

    const { name } = req.body;
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;

    // update data di DB
    await Products.update(
      { name: name, image: fileName, url: url },
      { where: { id: req.params.id } }
    );

    return res.status(200).json({ msg: "Product Updated Successfully" });
  } catch (error) {
    console.error("Update error:", error.message);
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
};



export const deleteProduct = async (req, res) => {
  try {
    // cari product
    const product = await Products.findOne({
      where: { id: req.params.id },
    });
    if (!product) {
      return res.status(404).json({ msg: "No Data Found" });
    }

    // path gambar
    const filepath = path.join("./public/images", product.image);

    // hapus file jika ada
    fs.unlink(filepath, (err) => {
      if (err) {
        console.log("File not found, skipping delete:", err.message);
      }
    });

    // hapus data di DB
    await Products.destroy({
      where: { id: req.params.id },
    });

    return res.status(200).json({ msg: "Product Deleted Successfully" });
  } catch (error) {
    console.error("Delete error:", error.message);
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
};
