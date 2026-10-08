import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { IconButton } from "@mui/material";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import { useRouter } from "next/router";
import { LIKE_PRODUCT } from "@/libs/graphql/products";
import { LIKE_SERVICE } from "@/libs/graphql/services";

type EntityLikeButtonProps = {
  entityType: "product" | "service";
  entityId?: string;
  initialLiked?: boolean;
  initialCount?: number;
  className?: string;
  label: string;
};

export default function EntityLikeButton({
  entityType,
  entityId,
  initialLiked = false,
  initialCount = 0,
  className,
  label,
}: EntityLikeButtonProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [error, setError] = useState("");
  const [likeProduct, { loading: productLoading }] = useMutation(LIKE_PRODUCT);
  const [likeService, { loading: serviceLoading }] = useMutation(LIKE_SERVICE);
  const loading = productLoading || serviceLoading;
  const canLike = Boolean(entityId && /^[a-f\d]{24}$/i.test(entityId));

  useEffect(() => {
    setLiked(initialLiked);
  }, [initialLiked]);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  const toggleLike = async () => {
    if (!canLike || loading) return;
    const token = localStorage.getItem("accessToken");
    if (!token) {
      const next = encodeURIComponent(router.asPath || "/");
      await router.push(`/sign-in?mode=signin&next=${next}`);
      return;
    }

    setError("");
    const wasLiked = liked;
    setLiked(!wasLiked);
    try {
      const response = entityType === "product"
        ? await likeProduct({ variables: { productId: entityId } })
        : await likeService({ variables: { serviceId: entityId } });
      const updated = entityType === "product"
        ? response.data?.likeTargetProduct
        : response.data?.likeTargetService;
      if (!updated) throw new Error("Like update returned no entity");
      setLiked(!wasLiked);
      setCount(Number(updated.productLikes ?? updated.serviceLikes ?? 0));
    } catch {
      setLiked(wasLiked);
      setError("Could not update like. Please try again.");
    }
  };

  return (
    <IconButton
      type="button"
      className={className}
      aria-label={`${liked ? "Unlike" : "Like"} ${label}${count ? `, ${count} likes` : ""}`}
      aria-pressed={liked}
      title={error || `${count} likes`}
      disabled={!canLike || loading}
      onClick={() => void toggleLike()}
    >
      {liked ? (
        <FavoriteRoundedIcon style={{ color: "#ed3f52" }} />
      ) : (
        <FavoriteBorderRoundedIcon />
      )}
      <span className="entity-like-count" aria-hidden="true">{count}</span>
      <span className="visually-hidden" role="status">{error}</span>
    </IconButton>
  );
}
