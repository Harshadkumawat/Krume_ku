import { motion } from "framer-motion";

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} // Start: Thoda neeche aur gayab
      animate={{ opacity: 1, y: 0 }} // End: Apni jagah par aur dikh raha hai
      exit={{ opacity: 0, y: -20 }} // Exit: Upar jate hue gayab
      transition={{ duration: 0.5, ease: "easeOut" }} // Aadhe second mein smooth
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
