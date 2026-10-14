import Category from "../models/category.Model.js";



export const gerAllCategories = async(req,res)=>{
    try{
        const categories =await Category.find()

        //res.send(categories)
        //console.log(categories)

        if (categories.length===0){
            return res.status(200).json({message:"Categories not added yet", categories:[]})
        }

        return res.status(200).json({message:"Categories get successfully ", categories})

    }
    catch (error){
        console.log(error);
        return res.status(500).json({message : "internal server error"});

    }
};

export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        const newCategory = new Category({ name, description });
        const savedCategory = await newCategory.save();

        return res.status(201).json({
            message: "Category created successfully",
            category: savedCategory
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: error.message });
    }
};